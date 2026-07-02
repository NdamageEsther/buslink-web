import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Profile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  agencyId?: string;
  createdAt?: string;
  agency?: { name: string };
}

export default function DriverProfilePage() {
  const { user } = useAuth();
  const [profile,   setProfile]   = useState<Profile | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");
  const [form,      setForm]      = useState({ name: "", phone: "", currentPassword: "", newPassword: "" });

  useEffect(() => {
    api.get("/users/profile").then(res => {
      const u = res.data?.user || res.data;
      setProfile(u);
      setForm(f => ({ ...f, name: u?.name || "", phone: u?.phone || "" }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.patch(`/users/${profile?.id}`, {
        name:  form.name,
        phone: form.phone,
        ...(form.newPassword ? { password: form.newPassword } : {}),
      });
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: "10px", fontSize: "14px", color: "#1e293b", outline: "none",
    boxSizing: "border-box", backgroundColor: "#f8fafc",
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", maxWidth: "700px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>My Profile</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>Manage your driver account information</p>
      </div>

      {success && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Profile card */}
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "20px" }}>

        {/* Header banner */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", padding: "28px 28px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "64px", height: "64px", backgroundColor: "#2563eb", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "800", color: "#fff" }}>
              {(profile?.name || user?.name || "D").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>{profile?.name || user?.name || "Driver"}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>🚌 Driver — {profile?.agency?.name || "BusLink"}</div>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div style={{ padding: "28px", marginTop: "-32px" }}>
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Full Name",  value: profile?.name || "—" },
                { label: "Email",      value: profile?.email || "—" },
                { label: "Phone",      value: profile?.phone || "—" },
                { label: "Role",       value: profile?.role || "DRIVER" },
                { label: "Agency",     value: profile?.agency?.name || "—" },
                { label: "Member Since", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-RW", { month: "long", day: "numeric", year: "numeric" }) : "—" },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{f.label}</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{loading ? "…" : f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {!editing ? (
            <button onClick={() => setEditing(true)}
              style={{ padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
            >✏️ Edit Profile</button>
          ) : (
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Personal Info</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Full Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+250..." style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>

              <p style={{ fontSize: "11px", fontWeight: "700", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "4px 0 0" }}>Change Password (optional)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>New Password</label>
                  <input type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Leave blank to keep current" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => { setEditing(false); setError(""); }}
                  style={{ flex: 1, padding: "11px", border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", borderRadius: "10px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: "11px", backgroundColor: saving ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}