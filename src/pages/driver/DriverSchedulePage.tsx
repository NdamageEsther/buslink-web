import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime?: string;
  status?: string;
  price?: number;
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

const STATUS_STYLE = {
  COMPLETED:   { bg: "#dcfce7", color: "#16a34a", label: "Completed" },
  IN_PROGRESS: { bg: "#dbeafe", color: "#1d4ed8", label: "In Progress" },
  UPCOMING:    { bg: "#fef9c3", color: "#92400e", label: "Upcoming" },
};

export default function DriverSchedulePage() {
  const [trips,   setTrips]   = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

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

  async function updateStatus(scheduleId: string, status: string) {
    setUpdating(scheduleId); setError("");
    try {
      await api.patch(`/drivers/trips/${scheduleId}/status`, { status });
      setSuccess(`Trip status updated to ${status}`);
      setTimeout(() => setSuccess(""), 3000);
      fetchTrips();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update status");
    } finally { setUpdating(null); }
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {success && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
          ⚠️ {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>My Schedule</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>All trips assigned to you today</p>
        </div>
        <button onClick={fetchTrips} disabled={loading}
          style={{ padding: "9px 18px", backgroundColor: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer", color: "#1d4ed8", display: "flex", alignItems: "center", gap: "6px" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Schedule Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📅</div>
            Loading schedule...
          </div>
        ) : trips.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📅</div>
            <p style={{ fontWeight: "600", margin: "0 0 4px" }}>No trips scheduled for today</p>
            <p style={{ fontSize: "13px", margin: 0 }}>Your agency admin will assign trips to you</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Route", "Bus", "Departure", "Arrival", "Passengers", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => {
                const tripStatus = getTripStatus(trip);
                const style      = STATUS_STYLE[tripStatus];
                const from       = trip.route?.fromStation?.name || "—";
                const to         = trip.route?.toStation?.name || "—";
                const dep        = new Date(trip.departureTime).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" });
                const arr        = trip.arrivalTime ? new Date(trip.arrivalTime).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) : "—";
                const passengers = trip.bookings?.length || 0;
                const scanned    = trip.bookings?.filter(b => b.ticket?.isValidated).length || 0;
                const date       = new Date(trip.departureTime).toLocaleDateString("en-RW", { month: "short", day: "numeric", year: "numeric" });

                return (
                  <tr key={trip.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700", color: "#1e293b" }}>{from} → {to}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{date}</div>
                    </td>
                    <td style={{ padding: "14px 18px", color: "#475569", fontWeight: "500" }}>{trip.bus?.plateNumber || "—"}</td>
                    <td style={{ padding: "14px 18px", color: "#475569" }}>{dep}</td>
                    <td style={{ padding: "14px 18px", color: "#475569" }}>{arr}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600" }}>{scanned}/{passengers}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>scanned</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", backgroundColor: style.bg, color: style.color }}>
                        {style.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {tripStatus === "UPCOMING" && (
                          <button onClick={() => updateStatus(trip.id, "BOARDING")}
                            disabled={updating === trip.id}
                            style={{ fontSize: "11px", fontWeight: "600", padding: "5px 10px", borderRadius: "7px", border: "none", backgroundColor: "#dbeafe", color: "#1d4ed8", cursor: "pointer" }}
                          >
                            {updating === trip.id ? "..." : "Start Boarding"}
                          </button>
                        )}
                        {tripStatus === "IN_PROGRESS" && (
                          <button onClick={() => updateStatus(trip.id, "ARRIVED")}
                            disabled={updating === trip.id}
                            style={{ fontSize: "11px", fontWeight: "600", padding: "5px 10px", borderRadius: "7px", border: "none", backgroundColor: "#dcfce7", color: "#16a34a", cursor: "pointer" }}
                          >
                            {updating === trip.id ? "..." : "Mark Arrived"}
                          </button>
                        )}
                        {tripStatus === "COMPLETED" && (
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Completed</span>
                        )}
                      </div>
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