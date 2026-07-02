import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime?: string;
  status?: string;
  route?: { fromStation?: { name: string }; toStation?: { name: string } };
  bus?: { plateNumber?: string; capacity?: number };
  bookings?: { id: string; status: string; ticket?: { isValidated: boolean } }[];
}

function getTripStatus(s: Schedule): "COMPLETED" | "IN_PROGRESS" | "UPCOMING" {
  const now = new Date();
  const dep = new Date(s.departureTime);
  const arr = s.arrivalTime ? new Date(s.arrivalTime) : null;
  const st  = s.status?.toUpperCase();
  if (st === "ARRIVED" || st === "COMPLETED") return "COMPLETED";
  if (st === "DEPARTED" || st === "BOARDING" || st === "IN_PROGRESS") return "IN_PROGRESS";
  if (arr && now > arr) return "COMPLETED";
  if (now >= dep) return "IN_PROGRESS";
  return "UPCOMING";
}

export default function DriverReportsPage() {
  const [trips,   setTrips]   = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await api.get("/drivers/trips/my");
      const data = res.data;
      const list: Schedule[] = Array.isArray(data) ? data
        : Array.isArray(data?.trips) ? data.trips : [];
      setTrips(list);
    } catch { setTrips([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const completed  = trips.filter(t => getTripStatus(t) === "COMPLETED");
  const inProgress = trips.filter(t => getTripStatus(t) === "IN_PROGRESS");
  const upcoming   = trips.filter(t => getTripStatus(t) === "UPCOMING");

  const totalPassengers = trips.flatMap(t => t.bookings || []).length;
  const totalScanned    = trips.flatMap(t => t.bookings || []).filter(b => b.ticket?.isValidated).length;
  const scanRate        = totalPassengers > 0 ? Math.round((totalScanned / totalPassengers) * 100) : 0;

  const STATUS_STYLE = {
    COMPLETED:   { bg: "#dcfce7", color: "#16a34a", label: "Completed" },
    IN_PROGRESS: { bg: "#dbeafe", color: "#1d4ed8", label: "In Progress" },
    UPCOMING:    { bg: "#fef9c3", color: "#92400e", label: "Upcoming" },
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Trip Reports</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>Summary of your trips and performance for today</p>
        </div>
        <button onClick={fetchTrips} disabled={loading}
          style={{ padding: "9px 18px", backgroundColor: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer", color: "#1d4ed8" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
        >🔄 Refresh</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Trips",      value: trips.length,      icon: "🚌", bg: "#dbeafe", color: "#1d4ed8" },
          { label: "Completed",        value: completed.length,  icon: "✅", bg: "#dcfce7", color: "#16a34a" },
          { label: "Total Passengers", value: totalPassengers,   icon: "👥", bg: "#ede9fe", color: "#7c3aed" },
          { label: "Scan Rate",        value: `${scanRate}%`,    icon: "🎫", bg: "#fef9c3", color: "#92400e" },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "44px", height: "44px", backgroundColor: s.bg, borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: s.color }}>{loading ? "…" : s.value}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Ticket Scan Progress</span>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#1d4ed8" }}>{totalScanned}/{totalPassengers} scanned</span>
        </div>
        <div style={{ height: "10px", backgroundColor: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${scanRate}%`, backgroundColor: "#1d4ed8", borderRadius: "10px", transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
          <span>{scanRate}% complete</span>
          <span>{totalPassengers - totalScanned} remaining</span>
        </div>
      </div>

      {/* Trip breakdown table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Trip Breakdown</h2>
        </div>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading reports...</div>
        ) : trips.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📊</div>
            <p style={{ fontWeight: "600", margin: 0 }}>No trips for today</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Route", "Bus", "Departure", "Passengers", "Scanned", "Scan Rate", "Status"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => {
                const tripStatus = getTripStatus(trip);
                const style      = STATUS_STYLE[tripStatus];
                const pass       = trip.bookings?.length || 0;
                const scanned    = trip.bookings?.filter(b => b.ticket?.isValidated).length || 0;
                const rate       = pass > 0 ? Math.round((scanned / pass) * 100) : 0;
                const from       = trip.route?.fromStation?.name || "—";
                const to         = trip.route?.toStation?.name || "—";
                const dep        = new Date(trip.departureTime).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" });

                return (
                  <tr key={trip.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1e293b" }}>{from} → {to}</td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>{trip.bus?.plateNumber || "—"}</td>
                    <td style={{ padding: "14px 16px", color: "#64748b" }}>{dep}</td>
                    <td style={{ padding: "14px 16px", color: "#1e293b", fontWeight: "600" }}>{pass}</td>
                    <td style={{ padding: "14px 16px", color: "#16a34a", fontWeight: "600" }}>{scanned}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${rate}%`, backgroundColor: "#1d4ed8", borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8", flexShrink: 0 }}>{rate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", backgroundColor: style.bg, color: style.color }}>
                        {style.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}