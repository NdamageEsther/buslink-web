import { useState, useEffect } from "react";
import api from "../../services/api";

interface Station {
  id: string;
  name: string;
  city?: string;
  address?: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
  borderRadius: "10px", fontSize: "14px", color: "#1e293b", outline: "none",
  boxSizing: "border-box", backgroundColor: "#f8fafc",
};

export default function StationsPage() {
  const [stations,       setStations]       = useState<Station[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Add modal
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addFormError,  setAddFormError]  = useState("");
  const [addForm,       setAddForm]       = useState({ name: "", city: "", address: "" });

  // Update modal
  const [showUpdateModal,  setShowUpdateModal]  = useState(false);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [updateFormError,  setUpdateFormError]  = useState("");
  const [updateForm,       setUpdateForm]       = useState({ name: "", city: "", address: "" });
  const [stationToUpdate,  setStationToUpdate]  = useState<Station | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);
  const [deleting,        setDeleting]        = useState(false);

  useEffect(() => { fetchStations(); }, []);

  async function fetchStations() {
    try {
      setLoading(true); setError("");
      const res  = await api.get("/stations");
      const data = res.data;
      if (Array.isArray(data))                setStations(data);
      else if (Array.isArray(data?.data))     setStations(data.data);
      else if (Array.isArray(data?.stations)) setStations(data.stations);
      else setStations([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load stations.");
      setStations([]);
    } finally { setLoading(false); }
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  // ── ADD ──────────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name) { setAddFormError("Station name is required."); return; }
    setAddSubmitting(true); setAddFormError("");
    try {
      await api.post("/stations", { name: addForm.name, city: addForm.city, address: addForm.address });
      showSuccess(`Station "${addForm.name}" created successfully!`);
      setAddForm({ name: "", city: "", address: "" });
      setShowAddModal(false);
      fetchStations();
    } catch (err: any) {
      setAddFormError(err?.response?.data?.message || "Failed to create station.");
    } finally { setAddSubmitting(false); }
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────
  function openUpdate(station: Station) {
    setStationToUpdate(station);
    setUpdateForm({ name: station.name, city: station.city || "", address: station.address || "" });
    setUpdateFormError("");
    setShowUpdateModal(true);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!stationToUpdate) return;
    if (!updateForm.name) { setUpdateFormError("Station name is required."); return; }
    setUpdateSubmitting(true); setUpdateFormError("");
    try {
      await api.patch(`/stations/${stationToUpdate.id}`, { name: updateForm.name, city: updateForm.city, address: updateForm.address });
      showSuccess(`Station "${updateForm.name}" updated successfully!`);
      setShowUpdateModal(false); setStationToUpdate(null);
      fetchStations();
    } catch (err: any) {
      setUpdateFormError(err?.response?.data?.message || "Failed to update station.");
    } finally { setUpdateSubmitting(false); }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!stationToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/stations/${stationToDelete.id}`);
      showSuccess(`Station "${stationToDelete.name}" deleted.`);
      setShowDeleteModal(false); setStationToDelete(null);
      fetchStations();
    } catch (err: any) {
      const msg  = err?.response?.data?.message || err?.response?.data?.error || "";
      const name = stationToDelete.name;
      setShowDeleteModal(false); setStationToDelete(null);
      const isLinked = ["foreign","constraint","restrict","route","referenced","relation"].some(k => msg.toLowerCase().includes(k));
      setError(isLinked
        ? `Cannot delete "${name}" — it is used by routes. Delete those routes first from the Agency Dashboard.`
        : msg || `Failed to delete "${name}".`);
    } finally { setDeleting(false); }
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Success */}
      {successMessage && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1, fontSize: "13px", color: "#dc2626" }}>{error}</div>
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "16px", padding: 0 }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Stations</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>Manage bus stations across Rwanda</p>
        </div>
        <button onClick={() => { setShowAddModal(true); setAddFormError(""); }}
          style={{ padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
        >+ Add Station</button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🚉</div>Loading stations...
          </div>
        ) : stations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🚉</div>
            <p style={{ fontWeight: "600", margin: 0 }}>No stations found.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Station Name", "Address", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", backgroundColor: "#dbeafe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", color: "#1e293b" }}>{s.name}</div>
                        {s.city && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{s.city}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", color: "#94a3b8", fontSize: "12px" }}>{s.address || "—"}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => openUpdate(s)}
                        style={{ fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "7px", border: "none", backgroundColor: "#eff6ff", color: "#1d4ed8", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#dbeafe")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                      >Update</button>
                      <button onClick={() => { setStationToDelete(s); setShowDeleteModal(true); setError(""); }}
                        style={{ fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "7px", border: "none", backgroundColor: "#fef2f2", color: "#dc2626", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fee2e2")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px" }}>Add New Station</h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>Add a bus station to the BusLink system.</p>
            {addFormError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>⚠️ {addFormError}</div>
            )}
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Station Name *", key: "name",    placeholder: "e.g. Nyabugogo Terminal" },
                { label: "City",           key: "city",    placeholder: "e.g. Kigali" },
                { label: "Address",        key: "address", placeholder: "e.g. KN 5 Ave, Kigali" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                  <input value={(addForm as any)[f.key]} onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              ))}
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
                >{addSubmitting ? "Creating..." : "Create Station"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPDATE MODAL ── */}
      {showUpdateModal && stationToUpdate && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px" }}>Update Station</h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>Edit details for <strong style={{ color: "#1d4ed8" }}>{stationToUpdate.name}</strong></p>
            {updateFormError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>⚠️ {updateFormError}</div>
            )}
            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Station Name *", key: "name",    placeholder: "e.g. Nyabugogo Terminal" },
                { label: "City",           key: "city",    placeholder: "e.g. Kigali" },
                { label: "Address",        key: "address", placeholder: "e.g. KN 5 Ave" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                  <input value={(updateForm as any)[f.key]} onChange={e => setUpdateForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              ))}
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" onClick={() => { setShowUpdateModal(false); setStationToUpdate(null); }}
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

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && stationToDelete && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>🗑️</div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 8px", textAlign: "center" }}>Delete Station</h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 16px", textAlign: "center" }}>
              Delete <strong style={{ color: "#1e293b" }}>{stationToDelete.name}</strong>?
            </p>
            <div style={{ backgroundColor: "#fef9c3", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#92400e", margin: 0, lineHeight: 1.7 }}>
                ⚠️ If this station is used by any routes, deletion will fail. Remove those routes from the Agency Dashboard first.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setShowDeleteModal(false); setStationToDelete(null); }}
                style={{ flex: 1, padding: "11px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
              >Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: "11px", backgroundColor: deleting ? "#fca5a5" : "#dc2626", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: deleting ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (!deleting) e.currentTarget.style.backgroundColor = "#b91c1c"; }}
                onMouseLeave={e => { if (!deleting) e.currentTarget.style.backgroundColor = "#dc2626"; }}
              >{deleting ? "Deleting..." : "Yes, Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}