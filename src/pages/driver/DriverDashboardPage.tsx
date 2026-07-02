import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime?: string;
  status?: string;
  price?: number;
  route?: {
    fromStation?: { name: string };
    toStation?: { name: string };
  };
  bus?: { plateNumber?: string; capacity?: number };
  bookings?: {
    id: string;
    status: string;
    passenger?: { name?: string; phone?: string };
    ticket?: { isValidated: boolean };
  }[];
}

function getTripStatus(schedule: Schedule): "COMPLETED" | "IN_PROGRESS" | "UPCOMING" {
  const now = new Date();
  const dep = new Date(schedule.departureTime);
  const arr = schedule.arrivalTime ? new Date(schedule.arrivalTime) : null;
  const st  = schedule.status?.toUpperCase();

  if (st === "ARRIVED" || st === "COMPLETED") return "COMPLETED";
  if (st === "DEPARTED" || st === "BOARDING" || st === "IN_PROGRESS") return "IN_PROGRESS";
  if (arr && now > arr) return "COMPLETED";
  if (now >= dep) return "IN_PROGRESS";
  return "UPCOMING";
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  COMPLETED:   { bg: "#dcfce7", color: "#16a34a", label: "Completed" },
  IN_PROGRESS: { bg: "#dbeafe", color: "#1d4ed8", label: "In Progress" },
  UPCOMING:    { bg: "#fef9c3", color: "#92400e", label: "Upcoming" },
};

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const [trips,   setTrips]   = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await api.get("/drivers/trips/my");
      const data = res.data;
      const list: Schedule[] = Array.isArray(data) ? data
        : Array.isArray(data?.trips) ? data.trips : [];
      setTrips(list);
      setLastUpdated(new Date().toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }));
    } catch { setTrips([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  // Stats
  const completed   = trips.filter(t => getTripStatus(t) === "COMPLETED");
  const inProgress  = trips.filter(t => getTripStatus(t) === "IN_PROGRESS");
  const upcoming    = trips.filter(t => getTripStatus(t) === "UPCOMING");
  const allBookings = trips.flatMap(t => t.bookings || []);
  const scanned     = allBookings.filter(b => b.ticket?.isValidated);
  const totalPass   = allBookings.length;

  const statCards = [
    {
      label: "Trips Completed",
      value: loading ? "…" : completed.length.toString(),
      sub: `${inProgress.length} in progress`,
      icon: "🚌",
      bg: "#dbeafe",
    },
    {
      label: "Total Passengers",
      value: loading ? "…" : totalPass.toString(),
      sub: "across all trips today",
      icon: "👥",
      bg: "#dcfce7",
    },
    {
      label: "Tickets Scanned",
      value: loading ? "…" : scanned.length.toString(),
      sub: `${totalPass - scanned.length} pending`,
      icon: "🎫",
      bg: "#ede9fe",
    },
  ];

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Driver Dashboard</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>
            Welcome, {user?.name || "Driver"}! Here's your today's overview.
            {lastUpdated && <span style={{ marginLeft: "8px", color: "#94a3b8" }}>Updated {lastUpdated}</span>}
          </p>
        </div>
        <button onClick={fetchTrips} disabled={loading}
          style={{ padding: "9px 18px", backgroundColor: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontWeight: "600", fontSize: "13px", cursor: loading ? "not-allowed" : "pointer", color: "#1d4ed8", display: "flex", alignItems: "center", gap: "6px" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {statCards.map(card => (
          <div key={card.label} style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "22px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: card.bg, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569", margin: "4px 0 2px" }}>{card.label}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Trips */}
      <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", margin: "0 0 2px" }}>Today's Trips</h2>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>All trips assigned to you for today</p>
          </div>
          <Link to="/driver/schedule" style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8", textDecoration: "none" }}>
            View full schedule →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>🚌</div>
            Loading trips...
          </div>
        ) : trips.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📅</div>
            <p style={{ fontWeight: "600", margin: "0 0 4px" }}>No trips assigned for today</p>
            <p style={{ fontSize: "13px", margin: 0 }}>Check back later or contact your agency admin</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {trips.map((trip, i) => {
              const tripStatus = getTripStatus(trip);
              const style      = STATUS_STYLE[tripStatus];
              const from       = trip.route?.fromStation?.name || "—";
              const to         = trip.route?.toStation?.name || "—";
              const dep        = new Date(trip.departureTime).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" });
              const arr        = trip.arrivalTime ? new Date(trip.arrivalTime).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) : "—";
              const passengers = trip.bookings?.length || 0;
              const scannedN   = trip.bookings?.filter(b => b.ticket?.isValidated).length || 0;

              return (
                <div key={trip.id}
                  style={{ padding: "20px 24px", borderBottom: i < trips.length - 1 ? "1px solid #f1f5f9" : "none", display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* Status indicator */}
                    <div style={{ width: "48px", height: "48px", backgroundColor: style.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "20px" }}>
                      {tripStatus === "COMPLETED" ? "✅" : tripStatus === "IN_PROGRESS" ? "🔄" : "⏳"}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>
                        {from} → {to}
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#64748b", flexWrap: "wrap" }}>
                        <span>🕐 {dep} – {arr}</span>
                        <span>🚌 {trip.bus?.plateNumber || "—"}</span>
                        <span>👥 {scannedN}/{passengers} scanned</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", backgroundColor: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                    <Link to={`/driver/passengers/${trip.id}`}
                      style={{ fontSize: "12px", fontWeight: "600", padding: "6px 14px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#1d4ed8", textDecoration: "none" }}
                    >
                      View Passengers
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}