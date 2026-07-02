import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Agency   { id: string; name: string; email: string; isApproved: boolean; }
interface Station  { id: string; name: string; city?: string; }
interface Booking  { id: string; passenger?: { name?: string; email?: string }; passengerName?: string; schedule?: { route?: { fromStation?: { name: string }; toStation?: { name: string } } }; totalAmount?: number; amount?: number; createdAt?: string; status?: string; }
interface User     { id: string; name?: string; email: string; role: string; }
interface Bus      { id: string; plateNumber?: string; capacity?: number; agency?: { name: string }; }
interface Driver   { id: string; name?: string; email?: string; agency?: { name: string }; }
interface Schedule { id: string; departureTime?: string; status?: string; route?: { fromStation?: { name: string }; toStation?: { name: string } }; }
interface Payment  { id: string; amount?: number; status?: string; createdAt?: string; }

function extract(data: any, keys: string[] = []): any[] {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  const found = Object.values(data || {}).find(v => Array.isArray(v));
  return (found as any[]) || [];
}

async function safeFetch(endpoint: string, keys: string[] = []): Promise<any[]> {
  try {
    const res = await api.get(endpoint);
    return extract(res.data, keys);
  } catch { return []; }
}

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [agencies,  setAgencies]  = useState<Agency[]>([]);
  const [stations,  setStations]  = useState<Station[]>([]);
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [users,     setUsers]     = useState<User[]>([]);
  const [buses,     setBuses]     = useState<Bus[]>([]);
  const [drivers,   setDrivers]   = useState<Driver[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [payments,  setPayments]  = useState<Payment[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [ag, st, bk, us, bu, dr, sc, pm] = await Promise.all([
      safeFetch("/agencies",  ["agencies"]),
      safeFetch("/stations",  ["stations"]),
      safeFetch("/bookings",  ["bookings"]),
      safeFetch("/users",     ["users"]),
      safeFetch("/buses",     ["buses"]),
      safeFetch("/drivers",   ["drivers"]),
      safeFetch("/schedules", ["schedules"]),
      safeFetch("/payments",  ["payments"]),
    ]);
    setAgencies(ag);
    setStations(st);
    setBookings(bk);
    setUsers(us);
    setBuses(bu);
    setDrivers(dr);
    setSchedules(sc);
    setPayments(pm);
    setLastUpdated(new Date().toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const passengers   = users.filter(u => u.role === "PASSENGER" || u.role === "passenger");
  const agencyAdmins = users.filter(u => u.role === "AGENCY_ADMIN" || u.role === "agency_admin");
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const recentBookings = bookings.slice(0, 6);

  function getRoute(b: Booking) {
    const from = b.schedule?.route?.fromStation?.name;
    const to   = b.schedule?.route?.toStation?.name;
    if (from && to) return `${from} → ${to}`;
    return "—";
  }
  function getPassenger(b: Booking) {
    return b.passenger?.name || b.passengerName || b.passenger?.email || "—";
  }
  function getAmount(b: Booking) {
    const amt = b.totalAmount ?? b.amount;
    return amt ? `RWF ${Number(amt).toLocaleString()}` : "—";
  }
  function getTime(b: Booking) {
    if (!b.createdAt) return "—";
    return new Date(b.createdAt).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" });
  }

  const statCards = [
    { label: "Total Passengers", value: loading ? "…" : passengers.length.toString(),            path: "/admin/users",    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: "Total Agencies",   value: loading ? "…" : agencies.length.toString(),              path: "/admin/agencies", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: "Bus Stations",     value: loading ? "…" : stations.length.toString(),              path: "/admin/stations", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
    { label: "Total Bookings",   value: loading ? "…" : bookings.length.toString(),              path: "/admin/reports",  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { label: "Total Revenue",    value: loading ? "…" : `RWF ${totalRevenue.toLocaleString()}`,  path: "/admin/reports",  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { label: "Total Buses",      value: loading ? "…" : buses.length.toString(),                 path: "/admin/agencies", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { label: "Total Drivers",    value: loading ? "…" : drivers.length.toString(),               path: "/admin/users",    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> },
    { label: "Active Schedules", value: loading ? "…" : schedules.length.toString(),             path: "/admin/reports",  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: "Agency Admins",    value: loading ? "…" : agencyAdmins.length.toString(),          path: "/admin/users",    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg> },
  ];

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── HERO BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
        borderRadius: "16px",
        padding: "32px 36px",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "20px",
      }}>
        {/* Radial glow */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 50%, rgba(96,165,250,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Left: name + role */}
        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", padding: "4px 14px", marginBottom: "14px" }}>
            <div style={{ width: "7px", height: "7px", backgroundColor: "#4ade80", borderRadius: "50%" }} />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px", fontWeight: "600" }}>
              System Admin Panel
            </span>
          </div>

          {/* Name */}
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#fff", margin: "0 0 8px", lineHeight: 1.1 }}>
            {user?.name || "System Admin"}
          </h1>

          {/* Description */}
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", margin: "0 0 14px", lineHeight: 1.6 }}>
            Manage agencies, stations, buses, drivers and bookings from one place.
          </p>

          {/* Role chip + last updated */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 14px", borderRadius: "20px", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", letterSpacing: "0.06em" }}>
              SYSTEM ADMIN
            </span>
            {lastUpdated && (
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                · Updated {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Right: quick action buttons */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={fetchAll}
            disabled={loading}
            style={{ padding: "10px 20px", backgroundColor: "#fff", color: "#1d4ed8", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: loading ? "spin 1s linear infinite" : "none" }}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>

          <Link to="/admin/agencies"
            style={{ padding: "10px 20px", backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: "10px", fontWeight: "700", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.22)"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.12)"}
          >
            + Add Agency
          </Link>

          <Link to="/admin/stations"
            style={{ padding: "10px 20px", backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: "10px", fontWeight: "700", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.22)"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.12)"}
          >
            + Add Station
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {statCards.map(stat => (
          <Link to={stat.path} key={stat.label} style={{ textDecoration: "none" }}>
            <div
              style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(29,78,216,0.10)"; (e.currentTarget as HTMLDivElement).style.borderColor = "#bfdbfe"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; }}
            >
              <div style={{ width: "48px", height: "48px", backgroundColor: "#eff6ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── TABLES ROW 1 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

        {/* Transport Agencies */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Transport Agencies <span style={{ color: "#1d4ed8" }}>({agencies.length})</span>
            </h2>
            <Link to="/admin/agencies" style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8", textDecoration: "none" }}>Manage all →</Link>
          </div>
          {loading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Loading...</div>
          ) : agencies.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No agencies found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Agency", "Email", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agencies.slice(0, 6).map(a => (
                  <tr key={a.id} style={{ borderTop: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "11px 18px", fontWeight: "600", color: "#1e293b" }}>{a.name}</td>
                    <td style={{ padding: "11px 18px", color: "#64748b", fontSize: "12px" }}>{a.email}</td>
                    <td style={{ padding: "11px 18px" }}>
                      <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "700", backgroundColor: a.isApproved ? "#dcfce7" : "#dbeafe", color: a.isApproved ? "#16a34a" : "#1d4ed8" }}>
                        {a.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Bookings */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Recent Bookings <span style={{ color: "#1d4ed8" }}>({bookings.length})</span>
            </h2>
            <Link to="/admin/reports" style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8", textDecoration: "none" }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Loading...</div>
          ) : recentBookings.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📋</div>
              No bookings found.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Passenger", "Route", "Amount", "Time"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, i) => (
                  <tr key={b.id || i} style={{ borderTop: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "11px 18px", fontWeight: "600", color: "#1e293b" }}>{getPassenger(b)}</td>
                    <td style={{ padding: "11px 18px", color: "#64748b", fontSize: "12px" }}>{getRoute(b)}</td>
                    <td style={{ padding: "11px 18px", fontWeight: "700", color: "#1d4ed8", fontSize: "12px" }}>{getAmount(b)}</td>
                    <td style={{ padding: "11px 18px", color: "#94a3b8", fontSize: "12px" }}>{getTime(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── TABLES ROW 2 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>

        {/* Buses */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Buses <span style={{ color: "#1d4ed8" }}>({buses.length})</span>
            </h2>
          </div>
          {loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Loading...</div>
          ) : buses.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No buses found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Plate Number", "Capacity", "Agency"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buses.slice(0, 5).map((b, i) => (
                  <tr key={b.id || i} style={{ borderTop: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "11px 18px", fontWeight: "600", color: "#1e293b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "28px", height: "28px", backgroundColor: "#dbeafe", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "13px" }}>🚌</div>
                        {b.plateNumber || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "11px 18px", color: "#64748b" }}>{b.capacity || "—"}</td>
                    <td style={{ padding: "11px 18px", color: "#64748b", fontSize: "12px" }}>{b.agency?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Drivers */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Drivers <span style={{ color: "#1d4ed8" }}>({drivers.length})</span>
            </h2>
          </div>
          {loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Loading...</div>
          ) : drivers.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No drivers found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Name", "Email", "Agency"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drivers.slice(0, 5).map((d, i) => (
                  <tr key={d.id || i} style={{ borderTop: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "11px 18px", fontWeight: "600", color: "#1e293b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "28px", height: "28px", backgroundColor: "#eff6ff", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "13px" }}>👤</div>
                        {d.name || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "11px 18px", color: "#64748b", fontSize: "12px" }}>{d.email || "—"}</td>
                    <td style={{ padding: "11px 18px", color: "#64748b", fontSize: "12px" }}>{d.agency?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stations */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Bus Stations <span style={{ color: "#1d4ed8" }}>({stations.length})</span>
            </h2>
            <Link to="/admin/stations" style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8", textDecoration: "none" }}>Manage →</Link>
          </div>
          {loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Loading...</div>
          ) : stations.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No stations found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Station Name", "City"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stations.slice(0, 5).map((s, i) => (
                  <tr key={s.id || i} style={{ borderTop: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "11px 18px", fontWeight: "600", color: "#1e293b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "26px", height: "26px", backgroundColor: "#dbeafe", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        {s.name}
                      </div>
                    </td>
                    <td style={{ padding: "11px 18px", color: "#64748b", fontSize: "12px" }}>{s.city || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Schedules */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Schedules <span style={{ color: "#1d4ed8" }}>({schedules.length})</span>
            </h2>
          </div>
          {loading ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Loading...</div>
          ) : schedules.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No schedules found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["Route", "Departure", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedules.slice(0, 5).map((s, i) => (
                  <tr key={s.id || i} style={{ borderTop: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "11px 18px", fontWeight: "600", color: "#1e293b", fontSize: "12px" }}>
                      {s.route?.fromStation?.name && s.route?.toStation?.name
                        ? `${s.route.fromStation.name} → ${s.route.toStation.name}`
                        : "—"}
                    </td>
                    <td style={{ padding: "11px 18px", color: "#64748b", fontSize: "12px" }}>
                      {s.departureTime
                        ? new Date(s.departureTime).toLocaleString("en-RW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td style={{ padding: "11px 18px" }}>
                      <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "700",
                        backgroundColor: s.status === "ACTIVE" ? "#dcfce7" : s.status === "CANCELLED" ? "#fef2f2" : "#dbeafe",
                        color: s.status === "ACTIVE" ? "#16a34a" : s.status === "CANCELLED" ? "#dc2626" : "#1d4ed8",
                      }}>
                        {s.status || "Scheduled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}