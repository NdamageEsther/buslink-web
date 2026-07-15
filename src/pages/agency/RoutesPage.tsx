import { useState, useEffect } from "react";
import api from "../../services/api";

interface Station { id: string; name: string; city: string; }
interface Route {
  id: string;
  fromStation?: Station;
  toStation?: Station;
  fromStationId?: string;
  toStationId?: string;
  distanceKm?: number;
  durationMinutes?: number;
  price?: number;
}

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data))     return data.data;
  if (data && Array.isArray(data.routes))   return data.routes;
  if (data && Array.isArray(data.stations)) return data.stations;
  if (data && typeof data === "object") {
    const v = Object.values(data).find(x => Array.isArray(x));
    if (v) return v as any[];
  }
  return [];
}

// ── Auto-calculate helpers ────────────────────────────────────────────────
function calcDuration(km: number): number { return Math.round(km * 3); }   // 3 min per km
function calcPrice(km: number): number    { return Math.round(km * 150); } // 150 RWF per km

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
  borderRadius: "10px", fontSize: "14px", color: "#1e293b", outline: "none",
  boxSizing: "border-box", backgroundColor: "#f8fafc",
};
const readonlyStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: "700",
  cursor: "not-allowed",
  borderColor: "#bfdbfe",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px",
};

export default function RoutesPage() {
  const [routes,         setRoutes]         = useState<Route[]>([]);
  const [stations,       setStations]       = useState<Station[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ── Add modal ────────────────────────────────────────────────────────────
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addFormError,  setAddFormError]  = useState("");
  const [addForm, setAddForm] = useState({
    fromStationId: "", toStationId: "",
    distanceKm: "", durationMinutes: "", price: "",
  });

  // ── Edit modal ───────────────────────────────────────────────────────────
  const [showEditModal,  setShowEditModal]  = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormError,  setEditFormError]  = useState("");
  const [editForm, setEditForm] = useState({
    distanceKm: "", durationMinutes: "", price: "",
  });
  const [routeToEdit, setRouteToEdit] = useState<Route | null>(null);

  // ── Delete modal ─────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [routeToDelete,   setRouteToDelete]   = useState<Route | null>(null);
  const [deleting,        setDeleting]        = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      setLoading(true); setError("");
      const [rRes, sRes] = await Promise.all([api.get("/routes"), api.get("/stations")]);
      setRoutes(extractArray(rRes.data));
      setStations(extractArray(sRes.data));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load routes.");
      setRoutes([]);
    } finally { setLoading(false); }
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  function stationName(id?: string, station?: Station) {
    if (station?.name) return station.name;
    return stations.find(s => s.id === id)?.name || "—";
  }

  function stationCity(id?: string, station?: Station) {
    if (station?.city) return station.city;
    return stations.find(s => s.id === id)?.city || "";
  }

  // ── Auto-calculate distance → duration + price ────────────────────────
  function handleAddDistanceChange(val: string) {
    const km = parseFloat(val);
    if (!isNaN(km) && km > 0) {
      setAddForm(p => ({
        ...p,
        distanceKm:      val,
        durationMinutes: calcDuration(km).toString(),
        price:           calcPrice(km).toString(),
      }));
    } else {
      setAddForm(p => ({
        ...p,
        distanceKm:      val,
        durationMinutes: "",
        price:           "",
      }));
    }
  }

  function handleEditDistanceChange(val: string) {
    const km = parseFloat(val);
    if (!isNaN(km) && km > 0) {
      setEditForm(p => ({
        ...p,
        distanceKm:      val,
        durationMinutes: calcDuration(km).toString(),
        price:           calcPrice(km).toString(),
      }));
    } else {
      setEditForm(p => ({
        ...p,
        distanceKm:      val,
        durationMinutes: "",
        price:           "",
      }));
    }
  }

  // ── Add route ─────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.fromStationId || !addForm.toStationId) {
      setAddFormError("From and To stations are required."); return;
    }
    if (addForm.fromStationId === addForm.toStationId) {
      setAddFormError("From and To stations must be different."); return;
    }
    if (!addForm.distanceKm) {
      setAddFormError("Distance is required."); return;
    }
    setAddSubmitting(true); setAddFormError("");
    try {
      await api.post("/routes", {
        fromStationId:   addForm.fromStationId,
        toStationId:     addForm.toStationId,
        distanceKm:      Number(addForm.distanceKm),
        durationMinutes: Number(addForm.durationMinutes),
        price:           Number(addForm.price),
      });
      showSuccess("Route added successfully!");
      setAddForm({ fromStationId: "", toStationId: "", distanceKm: "", durationMinutes: "", price: "" });
      setShowAddModal(false);
      fetchAll();
    } catch (err: any) {
      setAddFormError(err?.response?.data?.message || "Failed to add route.");
    } finally { setAddSubmitting(false); }
  }

  // ── Edit route ────────────────────────────────────────────────────────
  function openEdit(route: Route) {
    setRouteToEdit(route);
    const km = route.distanceKm || 0;
    setEditForm({
      distanceKm:      km ? String(km) : "",
      durationMinutes: km ? calcDuration(km).toString() : (route.durationMinutes ? String(route.durationMinutes) : ""),
      price:           km ? calcPrice(km).toString()    : (route.price           ? String(route.price)           : ""),
    });
    setEditFormError("");
    setShowEditModal(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!routeToEdit) return;
    if (!editForm.distanceKm) {
      setEditFormError("Distance is required."); return;
    }
    setEditSubmitting(true); setEditFormError("");
    try {
      await api.put(`/routes/${routeToEdit.id}`, {
        distanceKm:      Number(editForm.distanceKm),
        durationMinutes: Number(editForm.durationMinutes),
        price:           Number(editForm.price),
      });
      showSuccess("Route updated successfully!");
      setShowEditModal(false); setRouteToEdit(null);
      fetchAll();
    } catch (err: any) {
      setEditFormError(err?.response?.data?.message || "Failed to update route.");
    } finally { setEditSubmitting(false); }
  }

  // ── Delete route ──────────────────────────────────────────────────────
  async function handleDelete() {
    if (!routeToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/routes/${routeToDelete.id}`);
      showSuccess("Route removed successfully.");
      setShowDeleteModal(false); setRouteToDelete(null);
      fetchAll();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove route.");
      setShowDeleteModal(false); setRouteToDelete(null);
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
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Routes</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>
            Manage routes your agency operates — {routes.length} total
          </p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setAddFormError(""); }}
          style={{ padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Route
        </button>
      </div>

      {/* Calculation rule info */}
      <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "10px 16px", marginBottom: "16px", fontSize: "12px", color: "#1e40af", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "16px" }}>⚡</span>
        <span>
          <strong>Auto-calculation:</strong> Duration = 3 min/km · Price = 150 RWF/km.
          Enter distance and both values are calculated instantly.
        </span>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🛣️</div>
            Loading routes...
          </div>
        ) : routes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🛣️</div>
            <p style={{ fontWeight: "600", margin: "0 0 6px" }}>No routes yet</p>
            <p style={{ fontSize: "13px", margin: "0 0 20px" }}>Add your first route to get started</p>
            <button
              onClick={() => { setShowAddModal(true); setAddFormError(""); }}
              style={{ padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
            >+ Add First Route</button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["From", "To", "Distance", "Duration", "Price", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map(r => {
                const km  = r.distanceKm || 0;
                const dur = r.durationMinutes || (km ? calcDuration(km) : 0);
                const prc = r.price           || (km ? calcPrice(km)    : 0);

                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* From */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700", color: "#1e293b" }}>
                        {stationName(r.fromStationId, r.fromStation)}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                        {stationCity(r.fromStationId, r.fromStation)}
                      </div>
                    </td>

                    {/* To */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#1d4ed8" }}>→</span>
                        <div>
                          <div style={{ fontWeight: "600", color: "#475569" }}>
                            {stationName(r.toStationId, r.toStation)}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                            {stationCity(r.toStationId, r.toStation)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Distance */}
                    <td style={{ padding: "14px 18px" }}>
                      {km ? (
                        <span style={{ backgroundColor: "#f1f5f9", color: "#475569", fontWeight: "600", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>
                          📍 {km} km
                        </span>
                      ) : <span style={{ color: "#94a3b8" }}>—</span>}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: "14px 18px" }}>
                      {dur ? (
                        <span style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>
                          ⏱ {formatDuration(dur)}
                        </span>
                      ) : <span style={{ color: "#94a3b8" }}>—</span>}
                    </td>

                    {/* Price */}
                    <td style={{ padding: "14px 18px" }}>
                      {prc ? (
                        <span style={{ backgroundColor: "#dcfce7", color: "#16a34a", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>
                          💰 RWF {prc.toLocaleString()}
                        </span>
                      ) : <span style={{ color: "#94a3b8" }}>—</span>}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openEdit(r)}
                          style={{ fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "7px", border: "none", backgroundColor: "#eff6ff", color: "#1d4ed8", cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#dbeafe")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                        >✏️ Edit</button>
                        <button onClick={() => { setRouteToDelete(r); setShowDeleteModal(true); }}
                          style={{ fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "7px", border: "none", backgroundColor: "#fef2f2", color: "#dc2626", cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fee2e2")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                        >🗑 Remove</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── ADD ROUTE MODAL ── */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px" }}>Add New Route</h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
              Add a route your agency operates between two stations.
            </p>

            {/* Calculation rule hint */}
            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "9px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#1e40af" }}>
              ⚡ Enter the distance — <strong>Duration</strong> and <strong>Price</strong> are calculated automatically.
              <div style={{ marginTop: "4px", display: "flex", gap: "16px" }}>
                <span>⏱ 1 km = 3 min</span>
                <span>💰 1 km = RWF 150</span>
              </div>
            </div>

            {addFormError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>
                ⚠️ {addFormError}
              </div>
            )}

            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* From Station */}
              <div>
                <label style={labelStyle}>From Station *</label>
                <select
                  value={addForm.fromStationId}
                  onChange={e => setAddForm(p => ({ ...p, fromStationId: e.target.value }))}
                  required
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                >
                  <option value="">— Select departure station —</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name} — {s.city}</option>)}
                </select>
              </div>

              {/* To Station */}
              <div>
                <label style={labelStyle}>To Station *</label>
                <select
                  value={addForm.toStationId}
                  onChange={e => setAddForm(p => ({ ...p, toStationId: e.target.value }))}
                  required
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                >
                  <option value="">— Select destination —</option>
                  {stations.filter(s => s.id !== addForm.fromStationId).map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
                  ))}
                </select>
              </div>

              {/* Distance — triggers auto-calc */}
              <div>
                <label style={labelStyle}>Distance (km) *</label>
                <input
                  type="number"
                  value={addForm.distanceKm}
                  onChange={e => handleAddDistanceChange(e.target.value)}
                  placeholder="e.g. 110"
                  required
                  min="1"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>

              {/* Auto-calculated results */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {/* Duration — read only */}
                <div>
                  <label style={labelStyle}>
                    Duration
                    <span style={{ fontSize: "10px", color: "#60a5fa", fontWeight: "500", marginLeft: "5px", textTransform: "none" }}>
                      (auto: 3 min/km)
                    </span>
                  </label>
                  <input
                    value={addForm.durationMinutes
                      ? `${addForm.durationMinutes} min  (${formatDuration(Number(addForm.durationMinutes))})`
                      : ""}
                    readOnly
                    placeholder="Enter distance above"
                    style={readonlyStyle}
                  />
                </div>

                {/* Price — read only */}
                <div>
                  <label style={labelStyle}>
                    Price
                    <span style={{ fontSize: "10px", color: "#60a5fa", fontWeight: "500", marginLeft: "5px", textTransform: "none" }}>
                      (auto: 150 RWF/km)
                    </span>
                  </label>
                  <input
                    value={addForm.price
                      ? `RWF ${Number(addForm.price).toLocaleString()}`
                      : ""}
                    readOnly
                    placeholder="Enter distance above"
                    style={readonlyStyle}
                  />
                </div>
              </div>

              {/* Live preview card */}
              {addForm.distanceKm && addForm.durationMinutes && addForm.price && (
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                    ✅ Route Summary
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>{addForm.distanceKm} km</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Distance</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#1d4ed8" }}>
                        {formatDuration(Number(addForm.durationMinutes))}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Duration</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#16a34a" }}>
                        RWF {Number(addForm.price).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Price / seat</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button"
                  onClick={() => {
                    setShowAddModal(false); setAddFormError("");
                    setAddForm({ fromStationId: "", toStationId: "", distanceKm: "", durationMinutes: "", price: "" });
                  }}
                  style={{ flex: 1, padding: "11px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
                >Cancel</button>
                <button type="submit" disabled={addSubmitting}
                  style={{ flex: 1, padding: "11px", backgroundColor: addSubmitting ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: addSubmitting ? "not-allowed" : "pointer" }}
                  onMouseEnter={e => { if (!addSubmitting) e.currentTarget.style.backgroundColor = "#1e40af"; }}
                  onMouseLeave={e => { if (!addSubmitting) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
                >{addSubmitting ? "Adding..." : "Add Route"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT ROUTE MODAL ── */}
      {showEditModal && routeToEdit && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px" }}>Edit Route</h2>
            <p style={{ fontSize: "13px", color: "#1d4ed8", fontWeight: "600", margin: "0 0 16px" }}>
              {stationName(routeToEdit.fromStationId, routeToEdit.fromStation)}
              <span style={{ margin: "0 8px", color: "#94a3b8" }}>→</span>
              {stationName(routeToEdit.toStationId, routeToEdit.toStation)}
            </p>

            {/* Hint */}
            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "9px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#1e40af" }}>
              ⚡ Update the distance — Duration and Price recalculate automatically.
              <div style={{ marginTop: "4px", display: "flex", gap: "16px" }}>
                <span>⏱ 1 km = 3 min</span>
                <span>💰 1 km = RWF 150</span>
              </div>
            </div>

            {editFormError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>
                ⚠️ {editFormError}
              </div>
            )}

            <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Distance */}
              <div>
                <label style={labelStyle}>Distance (km) *</label>
                <input
                  type="number"
                  value={editForm.distanceKm}
                  onChange={e => handleEditDistanceChange(e.target.value)}
                  placeholder="e.g. 110"
                  required
                  min="1"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>

              {/* Auto-calculated */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>
                    Duration
                    <span style={{ fontSize: "10px", color: "#60a5fa", fontWeight: "500", marginLeft: "5px", textTransform: "none" }}>
                      (auto)
                    </span>
                  </label>
                  <input
                    value={editForm.durationMinutes
                      ? `${editForm.durationMinutes} min  (${formatDuration(Number(editForm.durationMinutes))})`
                      : ""}
                    readOnly
                    placeholder="Enter distance above"
                    style={readonlyStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Price
                    <span style={{ fontSize: "10px", color: "#60a5fa", fontWeight: "500", marginLeft: "5px", textTransform: "none" }}>
                      (auto)
                    </span>
                  </label>
                  <input
                    value={editForm.price
                      ? `RWF ${Number(editForm.price).toLocaleString()}`
                      : ""}
                    readOnly
                    placeholder="Enter distance above"
                    style={readonlyStyle}
                  />
                </div>
              </div>

              {/* Live preview */}
              {editForm.distanceKm && editForm.durationMinutes && editForm.price && (
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                    ✅ Updated Values
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>{editForm.distanceKm} km</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Distance</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#1d4ed8" }}>
                        {formatDuration(Number(editForm.durationMinutes))}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Duration</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#16a34a" }}>
                        RWF {Number(editForm.price).toLocaleString()}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Price / seat</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => { setShowEditModal(false); setRouteToEdit(null); }}
                  style={{ flex: 1, padding: "11px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
                >Cancel</button>
                <button type="submit" disabled={editSubmitting}
                  style={{ flex: 1, padding: "11px", backgroundColor: editSubmitting ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: editSubmitting ? "not-allowed" : "pointer" }}
                  onMouseEnter={e => { if (!editSubmitting) e.currentTarget.style.backgroundColor = "#1e40af"; }}
                  onMouseLeave={e => { if (!editSubmitting) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
                >{editSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDeleteModal && routeToDelete && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>🗑️</div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 8px", textAlign: "center" }}>Remove Route</h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 16px", textAlign: "center" }}>
              Remove <strong style={{ color: "#1d4ed8" }}>{stationName(routeToDelete.fromStationId, routeToDelete.fromStation)}</strong>
              <span style={{ color: "#1d4ed8", margin: "0 6px" }}>→</span>
              <strong style={{ color: "#1d4ed8" }}>{stationName(routeToDelete.toStationId, routeToDelete.toStation)}</strong>?
            </p>
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#dc2626", margin: 0 }}>
                ⚠️ All schedules on this route must be deleted first before removing the route.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setShowDeleteModal(false); setRouteToDelete(null); }}
                style={{ flex: 1, padding: "11px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
              >Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: "11px", backgroundColor: deleting ? "#fca5a5" : "#dc2626", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: deleting ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (!deleting) e.currentTarget.style.backgroundColor = "#b91c1c"; }}
                onMouseLeave={e => { if (!deleting) e.currentTarget.style.backgroundColor = "#dc2626"; }}
              >{deleting ? "Removing..." : "Yes, Remove"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}