import { useState, useEffect } from "react";
import api from "../../services/api";

interface Station { id: string; name: string; city: string; }
interface Agency { id: string; name: string; }
interface Link { agency: Agency; station: Station; counterNumber?: string; }

export default function AgencyStationLinkPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ agencyId: "", stationId: "", counterNumber: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchAll(); }, []);

  function extractArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.agencies)) return data.agencies;
    if (Array.isArray(data?.stations)) return data.stations;
    if (Array.isArray(data?.content)) return data.content;
    return [];
  }

  async function fetchAll() {
    try {
      setLoading(true);
      const [agRes, stRes] = await Promise.all([api.get("/agencies"), api.get("/stations")]);
      const agList = extractArray(agRes.data);
      const stList = extractArray(stRes.data);
      setAgencies(agList);
      setStations(stList);
      const allLinks: Link[] = [];
      for (const ag of agList) {
        try {
          const res = await api.get(`/agencies/${ag.id}/stations`);
          const list = extractArray(res.data);
          list.forEach((l: any) => allLinks.push({
            agency: ag,
            station: l.station || { id: l.stationId, name: l.stationName, city: l.city },
            counterNumber: l.counterNumber,
          }));
        } catch {}
      }
      setLinks(allLinks);
    } catch {
      setError("Failed to load data.");
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
    if (!form.agencyId || !form.stationId) { setFormError("Agency and station are required"); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post(`/agencies/${form.agencyId}/stations`, {
        stationId: form.stationId,
        counterNumber: form.counterNumber || "Counter 1",
      });
      showSuccess("Agency linked to station successfully!");
      setForm({ agencyId: "", stationId: "", counterNumber: "" });
      setShowModal(false);
      fetchAll();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to link agency to station");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnlink(agencyId: string, stationId: string, agencyName: string, stationName: string) {
    if (!confirm(`Unlink "${agencyName}" from "${stationName}"?`)) return;
    try {
      await api.delete(`/agencies/${agencyId}/stations/${stationId}`);
      showSuccess("Unlinked successfully!");
      fetchAll();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to unlink.");
    }
  }

  return (
    <div>
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">{successMessage}</div>}
      {error && <div className="bg-blue-50 border border-blue-200 text-blue-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Agency-Station Links</h1>
          <p className="text-gray-500 text-sm mt-1">Control which agencies operate from which stations</p>
        </div>
        <button onClick={() => { setShowModal(true); setFormError(""); }} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors uppercase tracking-wide">
          + Link Agency to Station
        </button>
      </div>

      {!loading && (
        <div className="text-xs text-gray-400 mb-4">
          Loaded {agencies.length} agencies, {stations.length} stations
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-extrabold text-[#0a1628] mb-1 uppercase">Link Agency to Station</h2>
            <p className="text-sm text-gray-500 mb-4">Select an agency and a station to link them.</p>
            {formError && <div className="bg-blue-50 text-blue-600 text-sm rounded-xl px-4 py-2 mb-4">{formError}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <select value={form.agencyId} onChange={e => setForm(p => ({ ...p, agencyId: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Agency ({agencies.length} available)</option>
                {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select value={form.stationId} onChange={e => setForm(p => ({ ...p, stationId: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select Station ({stations.length} available)</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name} — {s.city}</option>)}
              </select>
              <input value={form.counterNumber} onChange={e => setForm(p => ({ ...p, counterNumber: e.target.value }))} placeholder="Counter number e.g. Counter 1 (optional)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setShowModal(false); setFormError(""); }} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2.5 rounded-xl transition-colors">
                  {submitting ? "Linking..." : "Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : links.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-5xl mb-3">🔗</p>
            <p className="font-medium">No links yet.</p>
            <p className="text-sm mt-1">Click "+ Link Agency to Station" to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wide border-b">
                <th className="text-left pb-3">Agency</th>
                <th className="text-left pb-3">Station</th>
                <th className="text-left pb-3">City</th>
                <th className="text-left pb-3">Counter</th>
                <th className="text-left pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 font-bold text-gray-700">{l.agency.name}</td>
                  <td className="py-3 text-gray-600">{l.station?.name || "-"}</td>
                  <td className="py-3 text-gray-400 text-xs">{l.station?.city || "-"}</td>
                  <td className="py-3 text-gray-400 text-xs">{l.counterNumber || "-"}</td>
                  <td className="py-3">
                    <button onClick={() => handleUnlink(l.agency.id, l.station?.id, l.agency.name, l.station?.name)} className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      Unlink
                    </button>
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
