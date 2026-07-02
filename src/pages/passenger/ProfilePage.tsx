import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "buslink_passenger_profile";
function loadProfile() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const saved = loadProfile();
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: saved?.name || user?.name || "", email: saved?.email || user?.email || "", phone: saved?.phone || "", city: saved?.city || "" });
  const [display, setDisplay] = useState({ ...form });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setDisplay({ ...form }); setEditing(false);
    setSuccess("Profile updated successfully!");
    setTimeout(() => setSuccess(""), 4000);
  }

  const initial = (display.name || "P").charAt(0).toUpperCase();
  let bookingCount = 0;
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i)?.startsWith("buslink_booking_")) bookingCount++;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">{success}</div>}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#475569] uppercase">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account details</p>
      </div>

      <div className="bg-[#0a1628] rounded-2xl p-6 mb-5 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-inner">
            {initial}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold">{display.name}</h2>
            <p className="text-gray-300 text-sm">{display.email}</p>
            <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full mt-1 inline-block font-bold">
              {user?.role || "PASSENGER"}
            </span>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
              Edit ✏️
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold">{bookingCount}</p>
            <p className="text-xs text-gray-300">Total Bookings</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center cursor-pointer hover:bg-white/20 transition-colors" onClick={() => navigate("/bookings")}>
            <p className="text-2xl font-extrabold text-blue-400">→</p>
            <p className="text-xs text-gray-300">View History</p>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">Edit Profile</h3>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {[
              { label: "Full Name *", key: "name", type: "text", placeholder: "Your full name" },
              { label: "Email", key: "email", type: "email", placeholder: "your@email.com" },
              { label: "Phone Number", key: "phone", type: "text", placeholder: "+250 7XX XXX XXX" },
              { label: "City", key: "city", type: "text", placeholder: "e.g. Kigali" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
            ))}
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors">Save Changes</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h3 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Full Name", value: display.name || "-" },
              { label: "Email", value: display.email || "-" },
              { label: "Phone", value: display.phone || "-" },
              { label: "City", value: display.city || "-" },
              { label: "Role", value: user?.role || "PASSENGER" },
              { label: "Account Status", value: "Active" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                <p className="font-bold text-[#0a1628]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-700">📞 Need help? <span className="font-bold">support@buslink.rw</span></p>
        </div>
        <button onClick={() => { logout(); navigate("/login"); }} className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 rounded-2xl transition-colors text-sm">
          🚪 logout
        </button>
      </div>
    </div>
  );
}
