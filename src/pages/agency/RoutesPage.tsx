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
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.routes)) return data.routes;
  if (data && Array.isArray(data.stations)) return data.stations;
  if (data && typeof data === "object") {
    const arrProp = Object.values(data).find(v => Array.isArray(v));
    if (arrProp) return arrProp as any[];
  }
  return [];
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fromStationId: "", toStationId: "", distanceKm: "", durationMinutes: "", price: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      setError("");
      const [rRes, sRes] = await Promise.all([api.get("/routes"), api.get("/stations")]);
      setRoutes(extractArray(rRes.data));
      setStations(extractArray(sRes.data));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load routes.");
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  function stationName(id?: string, station?: Station) {
    if (station?.name) return `${station.name} — ${station.city}`;
    const found = stations.find(s => s.id === id);
    return found ? `${found.name} — ${found.city}` : "-";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fromStationId || !form.toStationId) { setFormError("From and To stations are required"); return; }
    if (form.fromStationId === form.toStationId) { setFormError("From and To stations must be different"); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/routes", {
        fromStationId: form.fromStationId,
        toStationId: form.toStationId,
        distanceKm: form.distanceKm ? Number(form.distanceKm) : undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        price: form.price ? Number(form.price) : undefined,
      });
      showSuccess("Route added successfully!");
      setForm({ fromStationId: "", toStationId: "", distanceKm: "", durationMinutes: "", price: "" });
      setShowModal(false);
      fetchAll();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to add route");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this route?")) return;
    try {
      await api.delete(`/routes/${id}`);
      showSuccess("Route removed.");
      fetchAll();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Delete failed — route may have linked schedules.");
    }
  }

  return (
    <div>
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">{successMessage}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Routes</h1>
          <p className="text-gray-500 text-sm mt-1">Manage routes your agency operates</p>
        </div>
        <button onClick={() => { setShowModal(true); setFormError(""); }} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors uppercase tracking-wide">
          + Add Route
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-extrabold text-[#0a1628] mb-1 uppercase">Add New Route</h2>
            <p className="text-sm text-gray-500 mb-4">Define a route between two stations.</p>
            {formError && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2 mb-4">{formError}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select value={form.fromStationId} onChange={e => setForm(p => ({ ...p, fromStationId: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">From Station</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name} — {s.city}</option>)}
              </select>
              <select value={form.toStationId} onChange={e => setForm(p => ({ ...p, toStationId: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">To Station</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name} — {s.city}</option>)}
              </select>
              <input type="number" value={form.distanceKm} onChange={e => setForm(p => ({ ...p, distanceKm: e.target.value }))} placeholder="Distance (km)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <input type="number" value={form.durationMinutes} onChange={e => setForm(p => ({ ...p, durationMinutes: e.target.value }))} placeholder="Duration (minutes)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Price (RWF)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(""); }} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2.5 rounded-xl transition-colors">
                  {submitting ? "Adding..." : "Add Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading routes...</div>
        ) : routes.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-5xl mb-3">🗺️</p>
            <p className="font-medium">No routes yet.</p>
            <p className="text-sm mt-1">Click "+ Add Route" to create your first route.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wide border-b">
                <th className="text-left pb-3">From</th>
                <th className="text-left pb-3">To</th>
                <th className="text-left pb-3">Distance</th>
                <th className="text-left pb-3">Duration</th>
                <th className="text-left pb-3">Price</th>
                <th className="text-left pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(r => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-3 font-bold text-gray-700">{stationName(r.fromStationId, r.fromStation)}</td>
                  <td className="py-3 text-gray-600">{stationName(r.toStationId, r.toStation)}</td>
                  <td className="py-3 text-gray-400 text-xs">{r.distanceKm ? `${r.distanceKm} km` : "-"}</td>
                  <td className="py-3 text-gray-400 text-xs">{r.durationMinutes ? `${r.durationMinutes} min` : "-"}</td>
                  <td className="py-3 text-orange-600 font-bold text-xs">{r.price ? `RWF ${r.price.toLocaleString()}` : "-"}</td>
                  <td className="py-3">
                    <button onClick={() => handleDelete(r.id)} className="text-xs font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
