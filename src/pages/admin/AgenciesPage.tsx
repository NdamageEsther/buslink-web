import { useState, useEffect } from "react";
import api from "../../services/api";

interface Agency {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isApproved: boolean;
  createdAt: string;
  adminEmail?: string;
  users?: { id: string; email: string; role: string; name?: string }[];
  admin?: { id: string; email: string; name: string };
}

interface AgencyAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  agencyId?: string;
  agency?: { id: string; name: string };
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
  borderRadius: "10px", fontSize: "14px", color: "#1e293b", outline: "none",
  boxSizing: "border-box", backgroundColor: "#f8fafc",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px",
};

export default function AgenciesPage() {
  const [agencies,        setAgencies]        = useState<Agency[]>([]);
  const [agencyAdmins,    setAgencyAdmins]    = useState<AgencyAdmin[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [successMessage,  setSuccessMessage]  = useState("");

  // Add modal
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [addSubmitting,  setAddSubmitting]  = useState(false);
  const [addFormError,   setAddFormError]   = useState("");
  const [addForm,        setAddForm]        = useState({
    // Agency fields
    agencyName: "", agencyEmail: "", agencyPhone: "", agencyStatus: "PENDING",
    // Admin fields
    adminName: "", adminEmail: "", adminPhone: "", adminPassword: "",
  });

  // Update modal
  const [showUpdateModal,  setShowUpdateModal]  = useState(false);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [updateFormError,  setUpdateFormError]  = useState("");
  const [agencyToUpdate,   setAgencyToUpdate]   = useState<Agency | null>(null);
  const [updateForm,       setUpdateForm]       = useState({
    name: "", email: "", phone: "", adminEmail: "", adminId: "",
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true); setError("");
    try {
      const [agenciesRes, usersRes] = await Promise.allSettled([
        api.get("/agencies"),
        api.get("/users"),
      ]);

      if (agenciesRes.status === "fulfilled") {
        const d = agenciesRes.value.data;
        const list: Agency[] = Array.isArray(d) ? d
          : Array.isArray(d?.data) ? d.data
          : Array.isArray(d?.agencies) ? d.agencies : [];
        setAgencies(list);
      }

      if (usersRes.status === "fulfilled") {
        const d = usersRes.value.data;
        const all: AgencyAdmin[] = Array.isArray(d) ? d
          : Array.isArray(d?.data) ? d.data
          : Array.isArray(d?.users) ? d.users : [];
        setAgencyAdmins(all.filter(u =>
          u.role === "AGENCY_ADMIN" || u.role === "agency_admin"
        ));
      }
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 5000);
  }

  // ── find admin email by cross-referencing users list ─────────────────────
  function getAdminEmail(agency: Agency): string {
    if (agency.admin?.email) return agency.admin.email;
    if (agency.adminEmail && !agency.adminEmail.includes("_")) return agency.adminEmail;
    const nested = agency.users?.find(u =>
      u.role === "AGENCY_ADMIN" || u.role === "agency_admin"
    );
    if (nested?.email) return nested.email;
    const matched = agencyAdmins.find(a =>
      a.agencyId === agency.id || a.agency?.id === agency.id
    );
    return matched?.email || "—";
  }

  function getAdminId(agency: Agency): string {
    if (agency.admin?.id) return agency.admin.id;
    const nested = agency.users?.find(u =>
      u.role === "AGENCY_ADMIN" || u.role === "agency_admin"
    );
    if (nested?.id) return nested.id;
    const matched = agencyAdmins.find(a =>
      a.agencyId === agency.id || a.agency?.id === agency.id
    );
    return matched?.id || "";
  }

  // ── ADD AGENCY + ADMIN ────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.agencyName || !addForm.agencyEmail) {
      setAddFormError("Agency name and email are required."); return;
    }
    if (!addForm.adminName || !addForm.adminEmail || !addForm.adminPassword) {
      setAddFormError("Admin full name, email and password are required."); return;
    }
    setAddSubmitting(true); setAddFormError("");
    try {
      // Step 1: Create the agency
      const agencyRes = await api.post("/agencies", {
        name:  addForm.agencyName,
        email: addForm.agencyEmail,
        phone: addForm.agencyPhone || undefined,
      });
      const agencyId = agencyRes.data?.id || agencyRes.data?.data?.id || agencyRes.data?.agency?.id;

      if (!agencyId) throw new Error("Agency created but no ID returned from server.");

      // Step 2: Create the agency admin linked to the new agency
      await api.post("/users/agency-admin", {
        name:     addForm.adminName,
        email:    addForm.adminEmail,
        phone:    addForm.adminPhone || "+250780000000",
        password: addForm.adminPassword,
        agencyId,
      });

      showSuccess(`✅ Agency "${addForm.agencyName}" and admin "${addForm.adminName}" created successfully! Both are now visible in the database.`);
      setAddForm({ agencyName: "", agencyEmail: "", agencyPhone: "", agencyStatus: "PENDING", adminName: "", adminEmail: "", adminPhone: "", adminPassword: "" });
      setShowAddModal(false);
      fetchData(); // re-fetch both agencies and users
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create agency.";
      setAddFormError(msg);
    } finally {
      setAddSubmitting(false);
    }
  }

  // ── UPDATE AGENCY ─────────────────────────────────────────────────────────
  function openUpdate(a: Agency) {
    setAgencyToUpdate(a);
    const adminEmail = getAdminEmail(a);
    const adminId    = getAdminId(a);
    setUpdateForm({
      name:       a.name,
      email:      a.email,
      phone:      a.phone || "",
      adminEmail: adminEmail !== "—" ? adminEmail : "",
      adminId,
    });
    setUpdateFormError("");
    setShowUpdateModal(true);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!agencyToUpdate) return;
    if (!updateForm.name || !updateForm.email) {
      setUpdateFormError("Agency name and email are required."); return;
    }
    setUpdateSubmitting(true); setUpdateFormError("");
    try {
      // Update agency
      await api.put(`/agencies/${agencyToUpdate.id}`, {
        name:  updateForm.name,
        email: updateForm.email,
        phone: updateForm.phone || undefined,
      });

      // If admin email changed, update the user record
      const originalAdminEmail = getAdminEmail(agencyToUpdate);
      if (updateForm.adminEmail && updateForm.adminEmail !== originalAdminEmail) {
        const matched = agencyAdmins.find(a => a.email === updateForm.adminEmail);
        const adminId = matched?.id || updateForm.adminId || getAdminId(agencyToUpdate);
        if (adminId) {
          await api.patch(`/users/${adminId}`, {
            email: updateForm.adminEmail,
          }).catch(() => {});
        }
      }

      showSuccess(`Agency "${updateForm.name}" updated successfully!`);
      setShowUpdateModal(false);
      setAgencyToUpdate(null);
      fetchData();
    } catch (err: any) {
      setUpdateFormError(err?.response?.data?.message || "Failed to update agency.");
    } finally {
      setUpdateSubmitting(false);
    }
  }

  // ── APPROVE ───────────────────────────────────────────────────────────────
  async function handleApprove(id: string, name: string) {
    try {
      await api.patch(`/agencies/${id}/approve`);
      showSuccess(`Agency "${name}" approved!`);
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to approve agency.");
    }
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Success */}
      {successMessage && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <span style={{ flexShrink: 0, marginTop: "1px" }}>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

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
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Agencies</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>Manage transport agencies and their admins</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setAddFormError(""); }}
          style={{ padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
        >+ Add Agency</button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏢</div>
            Loading agencies...
          </div>
        ) : agencies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🏢</div>
            <p style={{ fontWeight: "600", margin: 0 }}>No agencies found.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Agency Name", "Agency Email", "Phone", "Admin Email", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agencies.map(a => {
                const adminEmail = getAdminEmail(a);
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "13px 18px", fontWeight: "700", color: "#1e293b" }}>{a.name}</td>
                    <td style={{ padding: "13px 18px", color: "#64748b", fontSize: "12px" }}>{a.email}</td>
                    <td style={{ padding: "13px 18px", color: "#64748b", fontSize: "12px" }}>{a.phone || "—"}</td>
                    <td style={{ padding: "13px 18px", fontSize: "12px" }}>
                      {adminEmail !== "—" ? (
                        <span style={{ color: "#1d4ed8", fontWeight: "500" }}>{adminEmail}</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: "700", backgroundColor: a.isApproved ? "#dcfce7" : "#dbeafe", color: a.isApproved ? "#16a34a" : "#1d4ed8" }}>
                        {a.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openUpdate(a)}
                          style={{ fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "7px", border: "none", backgroundColor: "#eff6ff", color: "#1d4ed8", cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#dbeafe")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                        >Update</button>
                        {!a.isApproved && (
                          <button onClick={() => handleApprove(a.id, a.name)}
                            style={{ fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "7px", border: "none", backgroundColor: "#f0fdf4", color: "#16a34a", cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#dcfce7")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                          >Approve</button>
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

      {/* ── ADD AGENCY MODAL ── */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "500px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px" }}>Add New Agency</h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
              This will create the agency and its admin account in the database simultaneously.
            </p>

            {addFormError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
                ⚠️ {addFormError}
              </div>
            )}

            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* ── Agency Info Section ── */}
              <div style={{ backgroundColor: "#eff6ff", borderRadius: "10px", padding: "12px 14px", marginBottom: "4px" }}>
                <p style={{ fontSize: "11px", fontWeight: "800", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                  🏢 Agency Information
                </p>
              </div>

              <div>
                <label style={labelStyle}>Agency Name *</label>
                <input value={addForm.agencyName} onChange={e => setAddForm(p => ({ ...p, agencyName: e.target.value }))}
                  placeholder="e.g. RITCO Ltd" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>

              <div>
                <label style={labelStyle}>Agency Email *</label>
                <input value={addForm.agencyEmail} onChange={e => setAddForm(p => ({ ...p, agencyEmail: e.target.value }))}
                  placeholder="info@agency.com" type="email" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <input value={addForm.agencyPhone} onChange={e => setAddForm(p => ({ ...p, agencyPhone: e.target.value }))}
                  placeholder="+250 788 000 000" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select value={addForm.agencyStatus} onChange={e => setAddForm(p => ({ ...p, agencyStatus: e.target.value }))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")}>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                </select>
              </div>

              {/* ── Agency Admin Section ── */}
              <div style={{ backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "12px 14px", marginTop: "4px" }}>
                <p style={{ fontSize: "11px", fontWeight: "800", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                  👤 Agency Admin Account
                </p>
              </div>

              <div>
                <label style={labelStyle}>Admin Full Name *</label>
                <input value={addForm.adminName} onChange={e => setAddForm(p => ({ ...p, adminName: e.target.value }))}
                  placeholder="e.g. Jean Bosco" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>

              <div>
                <label style={labelStyle}>Admin Email *</label>
                <input value={addForm.adminEmail} onChange={e => setAddForm(p => ({ ...p, adminEmail: e.target.value }))}
                  placeholder="admin@agency.com" type="email" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>

              <div>
                <label style={labelStyle}>Admin Phone Number</label>
                <input value={addForm.adminPhone} onChange={e => setAddForm(p => ({ ...p, adminPhone: e.target.value }))}
                  placeholder="+250 788 000 000" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>

              <div>
                <label style={labelStyle}>Admin Password *</label>
                <input value={addForm.adminPassword} onChange={e => setAddForm(p => ({ ...p, adminPassword: e.target.value }))}
                  placeholder="Min 8 characters" type="password" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
              </div>

              {/* Info note */}
              <div style={{ backgroundColor: "#fef9c3", border: "1px solid #fde68a", borderRadius: "10px", padding: "10px 14px" }}>
                <p style={{ fontSize: "12px", color: "#92400e", margin: 0, lineHeight: 1.6 }}>
                  ℹ️ Submitting this form will create the agency and automatically link the admin account to it. Both will appear immediately on the Agencies and Users pages.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" onClick={() => { setShowAddModal(false); setAddFormError(""); }}
                  style={{ flex: 1, padding: "11px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
                >Cancel</button>
                <button type="submit" disabled={addSubmitting}
                  style={{ flex: 1, padding: "11px", backgroundColor: addSubmitting ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: addSubmitting ? "not-allowed" : "pointer" }}
                  onMouseEnter={e => { if (!addSubmitting) e.currentTarget.style.backgroundColor = "#1e40af"; }}
                  onMouseLeave={e => { if (!addSubmitting) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
                >{addSubmitting ? "Creating in database..." : "Create Agency + Admin"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPDATE AGENCY MODAL ── */}
      {showUpdateModal && agencyToUpdate && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px" }}>Update Agency</h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
              Editing <strong style={{ color: "#1d4ed8" }}>{agencyToUpdate.name}</strong> — saved directly to database.
            </p>
            {updateFormError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>⚠️ {updateFormError}</div>
            )}
            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Agency Name *",  key: "name",  type: "text" },
                { label: "Agency Email *", key: "email", type: "email" },
                { label: "Phone",          key: "phone", type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input value={(updateForm as any)[f.key]} onChange={e => setUpdateForm(p => ({ ...p, [f.key]: e.target.value }))}
                    type={f.type} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Admin Email</label>
                <select value={updateForm.adminEmail} onChange={e => setUpdateForm(p => ({ ...p, adminEmail: e.target.value }))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                >
                  <option value="">— Keep current admin —</option>
                  {agencyAdmins.map(admin => (
                    <option key={admin.id} value={admin.email}>
                      {admin.name} — {admin.email}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "4px 0 0" }}>
                  Only change this to reassign the admin. Leave as-is to keep the current admin.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" onClick={() => { setShowUpdateModal(false); setUpdateFormError(""); setAgencyToUpdate(null); }}
                  style={{ flex: 1, padding: "11px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
                >Cancel</button>
                <button type="submit" disabled={updateSubmitting}
                  style={{ flex: 1, padding: "11px", backgroundColor: updateSubmitting ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: updateSubmitting ? "not-allowed" : "pointer" }}
                  onMouseEnter={e => { if (!updateSubmitting) e.currentTarget.style.backgroundColor = "#1e40af"; }}
                  onMouseLeave={e => { if (!updateSubmitting) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
                >{updateSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}