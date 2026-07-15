import { useState, useEffect } from "react";
import api from "../../services/api";

interface Driver {
  id: string;
  user?: { name?: string; email?: string; phone?: string };
  name?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  bus?: { plateNumber?: string; id?: string };
  busId?: string;
  agencyId?: string;
  createdAt?: string;
}

interface Bus {
  id: string;
  plateNumber: string;
  capacity?: number;
  busType?: string;
}

export default function DriversPage() {
  const [drivers,       setDrivers]       = useState<Driver[]>([]);
  const [buses,         setBuses]         = useState<Bus[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [successMsg,    setSuccessMsg]    = useState("");
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [addLoading,    setAddLoading]    = useState(false);
  const [addError,      setAddError]      = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    password: "", confirmPassword: "",
    licenseNumber: "", busId: "",
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const [dRes, bRes] = await Promise.all([
        api.get("/drivers"),
        api.get("/buses").catch(() => ({ data: { buses: [] } })),
      ]);

      const dData = dRes.data;
      const dList: Driver[] =
        Array.isArray(dData)          ? dData :
        Array.isArray(dData?.drivers) ? dData.drivers :
        Array.isArray(dData?.data)    ? dData.data : [];
      setDrivers(dList);

      const bData = bRes.data;
      const bList: Bus[] =
        Array.isArray(bData)        ? bData :
        Array.isArray(bData?.buses) ? bData.buses :
        Array.isArray(bData?.data)  ? bData.data : [];
      setBuses(bList);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load drivers.");
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function handleAdd(e: React.FormEvent) {
  e.preventDefault();
  if (!form.name || !form.email || !form.phone || !form.password) {
    setAddError("Name, email, phone and password are required.");
    return;
  }
  if (form.password !== form.confirmPassword) {
    setAddError("Passwords do not match.");
    return;
  }
  if (form.password.length < 6) {
    setAddError("Password must be at least 6 characters.");
    return;
  }

  setAddLoading(true);
  setAddError("");

  try {
    // POST /users/driver — Agency Admin creates driver
    // Backend automatically creates User + Driver records linked to agency
    const res = await api.post("/users/driver", {
      name:          form.name,
      email:         form.email,
      phone:         form.phone,
      password:      form.password,
      licenseNumber: form.licenseNumber || "N/A",
    });

    const driverName = res.data?.user?.name || res.data?.name || form.name;

    showSuccess(`Driver "${driverName}" created successfully! They can now log in with: ${form.email}`);
    setForm({ name:"", email:"", phone:"", password:"", confirmPassword:"", licenseNumber:"", busId:"" });
    setShowAddModal(false);
    fetchAll(); // refresh the table
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.response?.data?.error || "";
    if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exist")) {
      setAddError("A user with this email already exists.");
    } else {
      setAddError(msg || "Failed to create driver. Please try again.");
    }
  } finally {
    setAddLoading(false);
  }
}

  function getDriverName(d: Driver)  { return d.user?.name  || d.name  || "—"; }
  function getDriverEmail(d: Driver) { return d.user?.email || d.email || "—"; }
  function getDriverPhone(d: Driver) { return d.user?.phone || d.phone || "—"; }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: "10px", fontSize: "14px", color: "#1e293b", outline: "none",
    boxSizing: "border-box", backgroundColor: "#f8fafc",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b",
    marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Success */}
      {successMsg && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>✅</span>
          <div style={{ lineHeight: 1.6 }}>{successMsg}</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px" }}>
          <span>⚠️</span>
          <div style={{ flex: 1, fontSize: "13px", color: "#dc2626" }}>{error}</div>
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Drivers</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>
            Manage your agency drivers — {drivers.length} registered
          </p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setAddError(""); }}
          style={{ padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Driver
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>👤</div>
            Loading drivers...
          </div>
        ) : drivers.length === 0 ? (
          <div style={{ padding: "60px 48px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>👤</div>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 6px" }}>No drivers yet</p>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>Add your first driver to get started</p>
            <button
              onClick={() => { setShowAddModal(true); setAddError(""); }}
              style={{ padding: "10px 24px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
            >
              + Add First Driver
            </button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Driver", "Email", "Phone", "License No.", "Assigned Bus", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "34px", height: "34px", backgroundColor: "#eff6ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "#1d4ed8", flexShrink: 0 }}>
                        {getDriverName(d).charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: "700", color: "#1e293b" }}>{getDriverName(d)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", color: "#64748b", fontSize: "12px" }}>{getDriverEmail(d)}</td>
                  <td style={{ padding: "14px 18px", color: "#64748b", fontSize: "12px" }}>{getDriverPhone(d)}</td>
                  <td style={{ padding: "14px 18px", color: "#64748b", fontSize: "12px" }}>{d.licenseNumber || "—"}</td>
                  <td style={{ padding: "14px 18px" }}>
                    {d.bus?.plateNumber ? (
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8", backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: "20px" }}>
                        🚌 {d.bus.plateNumber}
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Not assigned</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>View only</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── ADD DRIVER MODAL ── */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

            {/* Modal header */}
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px" }}>Add New Driver</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                Creates a driver account. The driver will log in using the email and password you set here.
              </p>
            </div>

            {addError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
                ⚠️ {addError}
              </div>
            )}

            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Personal info */}
              <p style={{ fontSize: "11px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                Personal Information
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Driver's full name"
                    required
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                    onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+250 7XX XXX XXX"
                    required
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                    onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Driver License Number</label>
                <input
                  value={form.licenseNumber}
                  onChange={e => setForm(p => ({ ...p, licenseNumber: e.target.value }))}
                  placeholder="e.g. RW-DL-2024-001"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>

              <div>
                <label style={labelStyle}>Assign Bus (Optional)</label>
                <select
                  value={form.busId}
                  onChange={e => setForm(p => ({ ...p, busId: e.target.value }))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                >
                  <option value="">— No bus assigned yet —</option>
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.plateNumber} {b.busType ? `(${b.busType})` : ""} {b.capacity ? `· ${b.capacity} seats` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Login credentials */}
              <p style={{ fontSize: "11px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "4px 0 0" }}>
                Login Credentials
              </p>

              <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "12px 14px" }}>
                <p style={{ fontSize: "12px", color: "#1e40af", margin: 0, lineHeight: 1.6 }}>
                  🔑 The driver will use these credentials to log in to the Driver Dashboard.
                  Share the email and password with them securely after creation.
                </p>
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="driver@email.com"
                  required
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                    required
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                    onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password *</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat password"
                    required
                    style={{
                      ...inputStyle,
                      borderColor: form.confirmPassword && form.confirmPassword !== form.password ? "#ef4444" : "#e2e8f0",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                    onBlur={e => (e.target.style.borderColor = form.confirmPassword !== form.password ? "#ef4444" : "#e2e8f0")}
                  />
                  {form.confirmPassword && form.confirmPassword !== form.password && (
                    <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0" }}>Passwords do not match</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setAddError(""); setForm({ name:"", email:"", phone:"", password:"", confirmPassword:"", licenseNumber:"", busId:"" }); }}
                  style={{ flex: 1, padding: "11px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  style={{ flex: 1, padding: "11px", backgroundColor: addLoading ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: addLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onMouseEnter={e => { if (!addLoading) e.currentTarget.style.backgroundColor = "#1e40af"; }}
                  onMouseLeave={e => { if (!addLoading) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
                >
                  {addLoading ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Creating Driver...
                    </>
                  ) : "Create Driver Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}