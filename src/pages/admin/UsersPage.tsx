import { useState, useEffect } from "react";
import api from "../../services/api";

interface AgencyAdmin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt?: string;
  agencyId?: string;
  agencyName?: string;
  agency?: { id: string; name: string };
}

interface Agency {
  id: string;
  name: string;
}

export default function UsersPage() {
  const [admins,   setAdmins]   = useState<AgencyAdmin[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true); setError("");
    try {
      const [usersRes, agenciesRes] = await Promise.allSettled([
        api.get("/users"),
        api.get("/agencies"),
      ]);

      if (usersRes.status === "fulfilled") {
        const d = usersRes.value.data;
        const all: AgencyAdmin[] = Array.isArray(d) ? d
          : Array.isArray(d?.data) ? d.data
          : Array.isArray(d?.users) ? d.users : [];
        // Show ONLY agency admins
        setAdmins(all.filter(u =>
          u.role === "AGENCY_ADMIN" || u.role === "agency_admin"
        ));
      }

      if (agenciesRes.status === "fulfilled") {
        const d = agenciesRes.value.data;
        const list: Agency[] = Array.isArray(d) ? d
          : Array.isArray(d?.data) ? d.data
          : Array.isArray(d?.agencies) ? d.agencies : [];
        setAgencies(list);
      }
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  function getAgencyName(u: AgencyAdmin): string {
    if (u.agency?.name) return u.agency.name;
    if (u.agencyName)   return u.agencyName;
    if (u.agencyId) {
      const found = agencies.find(a => a.id === u.agencyId);
      if (found) return found.name;
    }
    return "—";
  }

  const filtered = admins.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    getAgencyName(u).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>⚠️</span>
          <span style={{ flex: 1, fontSize: "13px", color: "#dc2626" }}>{error}</span>
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "16px" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Agency Admins</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>
            All agency administrator accounts — view only
          </p>
        </div>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email or agency..."
            style={{ padding: "9px 14px 9px 36px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", outline: "none", width: "260px", backgroundColor: "#f8fafc", color: "#1e293b" }}
            onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
            onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
          />
          <svg style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Agency Admins", value: admins.length,    icon: "👤" },
          { label: "Total Agencies",      value: agencies.length,  icon: "🏢" },
          { label: "Showing Results",     value: filtered.length,  icon: "🔍" },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontSize: "28px" }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: "800", color: "#1d4ed8", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>👤</div>
            Loading agency admins...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>👤</div>
            <p style={{ fontWeight: "600", margin: 0 }}>No agency admins found.</p>
            {search && <p style={{ fontSize: "13px", marginTop: "6px" }}>Try a different search term.</p>}
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  {["#", "Full Name", "Email", "Phone", "Assigned Agency", "Role", "Date Joined"].map(h => (
                    <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, index) => {
                  const agencyName = getAgencyName(u);
                  const initials = (u.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "13px 18px", color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>{index + 1}</td>
                      <td style={{ padding: "13px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "34px", height: "34px", backgroundColor: "#dbeafe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#1d4ed8", flexShrink: 0 }}>
                            {initials}
                          </div>
                          <span style={{ fontWeight: "700", color: "#1e293b" }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 18px", color: "#64748b", fontSize: "12px" }}>{u.email}</td>
                      <td style={{ padding: "13px 18px", color: "#64748b", fontSize: "12px" }}>{u.phone || "—"}</td>
                      <td style={{ padding: "13px 18px" }}>
                        {agencyName !== "—" ? (
                          <span style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: "20px" }}>
                            {agencyName}
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#1d4ed8", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: "20px" }}>
                          Agency Admin
                        </span>
                      </td>
                      <td style={{ padding: "13px 18px", color: "#94a3b8", fontSize: "12px" }}>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-RW", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "12px 18px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#94a3b8" }}>
              Showing {filtered.length} of {admins.length} agency admins
            </div>
          </>
        )}
      </div>
    </div>
  );
}