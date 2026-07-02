import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  schedule?: {
    departureTime: string;
    arrivalTime?: string;
    price: number;
    bus?: { plateNumber?: string };
    agency?: { name: string };
    route?: {
      fromStation?: { name: string };
      toStation?:   { name: string };
    };
  };
  ticket?: { id: string; isValidated: boolean; qrCode?: string };
}

export default function BookingHistoryPage() {
  const navigate  = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState<"ALL" | "CONFIRMED" | "USED" | "CANCELLED">("ALL");

  useEffect(() => {
    api.get("/bookings/my").then(res => {
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.bookings ?? [];
      setBookings(list);
    }).catch(err => {
      setError(err?.response?.data?.message || "Failed to load bookings");
    }).finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => filter === "ALL" || b.status === filter);

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    CONFIRMED:  { bg: "#dcfce7", color: "#16a34a" },
    USED:       { bg: "#dbeafe", color: "#1d4ed8" },
    CANCELLED:  { bg: "#fef2f2", color: "#dc2626" },
    PENDING:    { bg: "#fef9c3", color: "#92400e" },
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>My Bookings</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>All your bus bookings and tickets</p>
        </div>
        <button onClick={() => navigate("/home")}
          style={{ padding: "10px 18px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
          + Book New Trip
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {(["ALL", "CONFIRMED", "USED", "CANCELLED"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 16px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer",
              backgroundColor: filter === f ? "#1d4ed8" : "#f1f5f9",
              color: filter === f ? "#fff" : "#475569",
            }}>
            {f === "ALL" ? `All (${bookings.length})` : `${f.charAt(0) + f.slice(1).toLowerCase()} (${bookings.filter(b => b.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎫</div>
          Loading your bookings...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "48px", textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎫</div>
          <p style={{ fontWeight: "600", margin: "0 0 4px", color: "#475569" }}>No bookings found</p>
          <p style={{ fontSize: "13px", margin: "0 0 16px" }}>Book your first bus trip to get started</p>
          <button onClick={() => navigate("/home")}
            style={{ padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
            Search Buses →
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(booking => {
            const s      = booking.schedule;
            const dep    = s?.departureTime ? new Date(s.departureTime) : null;
            const depStr = dep ? dep.toLocaleDateString("en-RW", { weekday: "short", month: "short", day: "numeric" }) : "—";
            const depT   = dep ? dep.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) : "—";
            const style  = STATUS_STYLE[booking.status] || { bg: "#f1f5f9", color: "#475569" };

            return (
              <div key={booking.id} style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b" }}>
                      {s?.route?.fromStation?.name || "—"} → {s?.route?.toStation?.name || "—"}
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", backgroundColor: style.bg, color: style.color }}>
                      {booking.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#64748b", flexWrap: "wrap" }}>
                    <span>📅 {depStr}</span>
                    <span>🕐 {depT}</span>
                    {s?.agency && <span>🏢 {s.agency.name}</span>}
                    {s?.bus && <span>🚌 {s.bus.plateNumber}</span>}
                    {s?.price && <span style={{ fontWeight: "700", color: "#1d4ed8" }}>RWF {s.price.toLocaleString()}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                  {booking.ticket && (
                    <button onClick={() => navigate(`/ticket/${booking.id}`)}
                      style={{ padding: "8px 16px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}>
                      🎫 View Ticket
                    </button>
                  )}
                  {booking.status === "CONFIRMED" && !booking.ticket && (
                    <button onClick={() => navigate(`/payment?bookingId=${booking.id}`)}
                      style={{ padding: "8px 16px", backgroundColor: "#f59e0b", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                      💳 Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}