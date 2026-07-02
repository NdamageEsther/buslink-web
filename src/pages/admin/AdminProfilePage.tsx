import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const STORAGE_KEY = "buslink_admin_profile";

function loadProfile() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

export default function AdminProfilePage() {
  const { user } = useAuth();
  const saved = loadProfile();
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: saved?.name || user?.name || "",
    email: saved?.email || user?.email || "",
    phone: saved?.phone || "",
    department: saved?.department || "System Administration",
  });
  const [display, setDisplay] = useState({ ...form });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setDisplay({ ...form });
    setEditing(false);
    setSuccess("Profile updated successfully!");
    setTimeout(() => setSuccess(""), 4000);
  }

  const initial = (display.name || "A").charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">{success}</div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#475569] uppercase">Admin Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your system administrator account</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 flex items-center gap-6">
        <div className="w-20 h-20 bg-[#475569] rounded-2xl flex items-center justify-center text-blue-500 text-3xl font-extrabold shadow-md">
          {initial}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-[#475569]">{display.name}</h2>
          <p className="text-gray-400 text-sm mt-1">{display.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-700">SYSTEM_ADMIN</span>
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-green-100 text-green-700">ACTIVE</span>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors uppercase tracking-wide"
          >
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-extrabold text-[#475569] uppercase mb-4">Edit Profile</h3>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {[
              { label: "Full Name *", key: "name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "text" },
              { label: "Department", key: "department", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-extrabold text-[#475569] uppercase mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: display.name },
              { label: "Email", value: display.email },
              { label: "Phone", value: display.phone || "-" },
              { label: "Department", value: display.department },
              { label: "Role", value: "SYSTEM_ADMIN" },
              { label: "Status", value: "ACTIVE" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                <p className="font-bold text-[#475569]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
