import { useState, useEffect } from "react";
import api from "../../services/api";

interface Route { id: string; fromStation?: any; toStation?: any; }
interface Bus { id: string; plateNumber: string; capacity: number; }
interface Driver { id: string; name: string; }
interface Schedule {
  id: string; route?: Route; bus?: Bus; driver?: Driver;
  routeId?: string; busId?: string; driverId?: string;
  departureTime: string; arrivalTime?: string; status?: string; price?: number;
}

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.schedules)) return data.schedules;
  if (data && Array.isArray(data.routes)) return data.routes;
  if (data && Array.isArray(data.buses)) return data.buses;
  if (data && typeof data === "object") {
    const arrProp = Object.values(data).find(v => Array.isArray(v));
    if (arrProp) return arrProp as any[];
  }
  return [];
}

async function safeFetch(endpoint: string): Promise<any[]> {
  try { const res = await api.get(endpoint); return extractArray(res.data); } catch { return []; }
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ routeId: "", busId: "", driverId: "", departureTime: "", arrivalTime: "", price: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [sch, rts, bss, drvs] = await Promise.all([
      safeFetch("/schedules"), safeFetch("/routes"), safeFetch("/buses"), safeFetch("/drivers"),
    ]);
    setSchedules(sch); setRoutes(rts); setBuses(bss); setDrivers(drvs);
    setLoading(false);
  }

  function showSuccess(msg: string) { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(""), 4000); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.routeId || !form.busId || !form.departureTime) { setFormError("Route, bus, and departure time are required"); return; }
    setSubmitting(true); setFormError("");
    try {
      await api.post("/schedules", {
        routeId: form.routeId, busId: form.busId,
        driverId: form.driverId || undefined,
        departureTime: new Date(form.departureTime).toISOString(),
        arrivalTime: form.arrivalTime ? new Date(form.arrivalTime).toISOString() : undefined,
        price: form.price ? Number(form.price) : undefined,
      });
      showSuccess("Schedule created successfully!");
      setForm({ routeId: "", busId: "", driverId: "", departureTime: "", arrivalTime: "", price: "" });
      setShowModal(false); fetchAll();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to create schedule");
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this schedule?")) return;
    try { await api.delete(`/schedules/${id}`); showSuccess("Schedule removed."); fetchAll(); }
    catch (err: any) { setError(err?.response?.data?.message || "Delete failed."); }
  }

  function formatDateTime(dt: string) {
    if (!dt) return "-";
    try { return new Date(dt).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return dt; }
  }

  function getRouteLabel(s: Schedule) {
    const route = s.route || routes.find(r => r.id === s.routeId) as any;
    if (!route) return "-";
    return `${route.fromStation?.name || "-"} → ${route.toStation?.name || "-"}`;
  }

  return (
    <div>
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">{successMessage}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Schedules</h1>
          <p className="text-gray-500 text-sm mt-1">Manage departure schedules for your routes</p>
        </div>
        <button onClick={() => { setShowModal(true); setFormError(""); }} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors uppercase tracking-wide">
          + Add Schedule
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-extrabold text-[#0a1628] mb-1 uppercase">Add New Schedule</h2>
            <p className="text-sm text-gray-500 mb-4">Assign a route, bus, and departure time.</p>
            {formError && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2 mb-4">{formError}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select value={form.routeId} onChange={e => setForm(p => ({ ...p, routeId: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Route</option>
                {routes.map(r => <option key={r.id} value={r.id}>{(r as any).fromStation?.name || "-"} → {(r as any).toStation?.name || "-"}</option>)}
              </select>
              <select value={form.busId} onChange={e => setForm(p => ({ ...p, busId: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Bus</option>
                {buses.map(b => <option key={b.id} value={b.id}>{b.plateNumber} (cap: {b.capacity})</option>)}
              </select>
              {drivers.length > 0 && (
                <select value={form.driverId} onChange={e => setForm(p => ({ ...p, driverId: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Driver (optional)</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Departure Time</label>
                <input type="datetime-local" value={form.departureTime} onChange={e => setForm(p => ({ ...p, departureTime: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Arrival Time (optional)</label>
                <input type="datetime-local" value={form.arrivalTime} onChange={e => setForm(p => ({ ...p, arrivalTime: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Price (RWF) — optional" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(""); }} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2.5 rounded-xl transition-colors">
                  {submitting ? "Saving..." : "Add Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-5xl mb-3">⏰</p>
            <p className="font-medium">No schedules yet.</p>
            <p className="text-sm mt-1">Click "+ Add Schedule" to create your first schedule.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wide border-b">
                <th className="text-left pb-3">Route</th>
                <th className="text-left pb-3">Bus</th>
                <th className="text-left pb-3">Driver</th>
                <th className="text-left pb-3">Departure</th>
                <th className="text-left pb-3">Arrival</th>
                <th className="text-left pb-3">Price</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-left pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 font-bold text-gray-700">{getRouteLabel(s)}</td>
                  <td className="py-3 text-gray-500">{s.bus?.plateNumber || buses.find(b => b.id === s.busId)?.plateNumber || "-"}</td>
                  <td className="py-3 text-gray-500">{s.driver?.name || drivers.find(d => d.id === s.driverId)?.name || "-"}</td>
                  <td className="py-3 text-gray-600 text-xs">{formatDateTime(s.departureTime)}</td>
                  <td className="py-3 text-gray-400 text-xs">{s.arrivalTime ? formatDateTime(s.arrivalTime) : "-"}</td>
                  <td className="py-3 text-orange-600 font-bold text-xs">{s.price ? `RWF ${s.price.toLocaleString()}` : "-"}</td>
                  <td className="py-3"><span className="text-xs px-2 py-1 rounded-full font-bold bg-blue-100 text-blue-700">{s.status || "Scheduled"}</span></td>
                  <td className="py-3"><button onClick={() => handleDelete(s.id)} className="text-xs font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
