import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface AgencyInfo {
  id: string; name: string; email?: string; phone?: string;
  address?: string; licenseNumber?: string; status?: string;
  createdAt?: string; description?: string;
}

const STORAGE_KEY = "buslink_agency_profile";
function loadLocalProfile(): AgencyInfo | null { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveLocalProfile(data: AgencyInfo) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

export default function AgencyProfilePage() {
  const { user } = useAuth();
  const [agency, setAgency] = useState<AgencyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", description: "" });

  useEffect(() => { fetchAgency(); }, []);

  async function fetchAgency() {
    setLoading(true);
    for (const endpoint of ["/agencies/my", "/agency/profile", "/agencies/me"]) {
      try {
        const res = await api.get(endpoint);
        const data = res.data?.data || res.data;
        setAgency(data);
        setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "", address: data.address || "", description: data.description || "" });
        setLoading(false); return;
      } catch {}
    }
    const local = loadLocalProfile();
    if (local) {
      setAgency(local);
      setForm({ name: local.name || "", email: local.email || "", phone: local.phone || "", address: local.address || "", description: local.description || "" });
    } else {
      const fallback: AgencyInfo = { id: "local", name: user?.name || "My Agency", email: user?.email || "", status: "ACTIVE" };
      setAgency(fallback);
      setForm({ name: fallback.name, email: fallback.email || "", phone: "", address: "", description: "" });
    }
    setLoading(false);
  }

  function showSuccess(msg: string) { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(""), 4000); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError("");
    let saved = false;
    for (const endpoint of ["/agencies/my", "/agency/profile", `/agencies/${agency?.id}`]) {
      try {
        await api.patch(endpoint, { name: form.name, email: form.email || undefined, phone: form.phone || undefined, address: form.address || undefined, description: form.description || undefined });
        saved = true; break;
      } catch {}
    }
    const updated: AgencyInfo = {
      id: agency?.id || "local", name: form.name, email: form.email, phone: form.phone,
      address: form.address, description: form.description,
      licenseNumber: agency?.licenseNumber, status: agency?.status || "ACTIVE", createdAt: agency?.createdAt,
    };
    saveLocalProfile(updated);
    setAgency(updated); setEditing(false); setError("");
    showSuccess(saved ? "Profile updated successfully!" : "Profile saved locally!");
    setSubmitting(false);
  }

  const displayName = agency?.name || user?.name || "Agency";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto">
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">{successMessage}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Agency Profile</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage your agency information</p>
      </div>
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading profile...</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 flex items-center gap-6">
            <div className="w-20 h-20 bg-[#0a1628] rounded-2xl flex items-center justify-center text-blue-500 text-3xl font-extrabold shadow-md">
              {initial}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-[#0a1628]">{displayName}</h2>
              <p className="text-gray-400 text-sm mt-1">{agency?.email || user?.email || "-"}</p>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${agency?.status === "INACTIVE" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                  {agency?.status || "ACTIVE"}
                </span>
                {agency?.licenseNumber && (
                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-700">
                    License: {agency.licenseNumber}
                  </span>
                )}
              </div>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors uppercase tracking-wide">
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-extrabold text-[#0a1628] uppercase mb-4">Edit Agency Information</h3>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                {[
                  { label: "Agency Name *", key: "name", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Phone", key: "phone", type: "text" },
                  { label: "Address", key: "address", type: "text" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => { setEditing(false); setError(""); }} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2.5 rounded-xl transition-colors">
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-extrabold text-[#0a1628] uppercase mb-4">Agency Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Agency Name", value: agency?.name || "-" },
                  { label: "Email", value: agency?.email || "-" },
                  { label: "Phone", value: agency?.phone || "-" },
                  { label: "Address", value: agency?.address || "-" },
                  { label: "License Number", value: agency?.licenseNumber || "-" },
                  { label: "Member Since", value: agency?.createdAt ? new Date(agency.createdAt).toLocaleDateString("en-RW", { dateStyle: "medium" }) : "-" },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-bold text-[#0a1628]">{item.value}</p>
                  </div>
                ))}
              </div>
              {agency?.description && (
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Description</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{agency.description}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
            <h3 className="text-lg font-extrabold text-[#0a1628] uppercase mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Logged in as", value: user?.name || "-" },
                { label: "Account Email", value: user?.email || "-" },
                { label: "Role", value: user?.role || "AGENCY_ADMIN" },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-bold text-[#0a1628]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
