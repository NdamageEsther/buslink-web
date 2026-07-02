import { useState, useEffect } from "react";
import api from "../../services/api";

interface Bus {
  id: string;
  plateNumber: string;
  busType?: string;
  capacity: number;
  status?: string;
}

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.buses)) return data.buses;
  if (data && typeof data === "object") {
    const arrProp = Object.values(data).find(v => Array.isArray(v));
    if (arrProp) return arrProp as any[];
  }
  return [];
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ plateNumber: "", busType: "", capacity: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchBuses(); }, []);

  async function fetchBuses() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/buses");
      setBuses(extractArray(res.data));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load buses.");
      setBuses([]);
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.plateNumber || !form.capacity) { setFormError("Plate number and capacity are required"); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/buses", {
        plateNumber: form.plateNumber,
        busType: form.busType || "Standard",
        capacity: Number(form.capacity),
      });
      showSuccess(`Bus "${form.plateNumber}" added successfully!`);
      setForm({ plateNumber: "", busType: "", capacity: "" });
      setShowModal(false);
      fetchBuses();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to add bus");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, plate: string) {
    if (!confirm(`Remove bus "${plate}"?`)) return;
    try {
      await api.delete(`/buses/${id}`);
      showSuccess(`Bus "${plate}" removed.`);
      fetchBuses();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Delete failed — bus may have linked data.");
    }
  }

  return (
    <div>
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">{successMessage}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Buses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your fleet of buses</p>
        </div>
        <button onClick={() => { setShowModal(true); setFormError(""); }} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors uppercase tracking-wide">
          + Add Bus
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-extrabold text-[#0a1628] mb-1 uppercase">Add New Bus</h2>
            <p className="text-sm text-gray-500 mb-4">Register a bus to your fleet.</p>
            {formError && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2 mb-4">{formError}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input value={form.plateNumber} onChange={e => setForm(p => ({ ...p, plateNumber: e.target.value }))} placeholder="Plate number e.g. RAD 123 A" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <input value={form.busType} onChange={e => setForm(p => ({ ...p, busType: e.target.value }))} placeholder="Bus type e.g. Coaster, Minibus (optional)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} placeholder="Capacity e.g. 30" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(""); }} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2.5 rounded-xl transition-colors">
                  {submitting ? "Adding..." : "Add Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading buses...</div>
        ) : buses.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-5xl mb-3">🚌</p>
            <p className="font-medium">No buses yet.</p>
            <p className="text-sm mt-1">Click "+ Add Bus" to register your first bus.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wide border-b">
                <th className="text-left pb-3">Plate Number</th>
                <th className="text-left pb-3">Type</th>
                <th className="text-left pb-3">Capacity</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-left pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map(b => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-3 font-bold text-gray-700">{b.plateNumber}</td>
                  <td className="py-3 text-gray-500">{b.busType || "-"}</td>
                  <td className="py-3 text-gray-500">{b.capacity}</td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-1 rounded-full font-bold bg-green-100 text-green-700">{b.status || "Active"}</span>
                  </td>
                  <td className="py-3">
                    <button onClick={() => handleDelete(b.id, b.plateNumber)} className="text-xs font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Remove</button>
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
