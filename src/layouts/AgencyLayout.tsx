import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/shared/Navbar";
import api from "../services/api";

const menuItems = [
  { label: "Dashboard",      path: "/agency/dashboard",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { label: "Buses",          path: "/agency/buses",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { label: "Routes",         path: "/agency/routes",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg> },
  { label: "Schedules",      path: "/agency/schedules",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: "Drivers",        path: "/agency/drivers",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: "Bookings",       path: "/agency/bookings",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"/><path d="M16 2l4 4-8 8H8v-4l8-8z"/></svg> },
  { label: "Reports",        path: "/agency/reports",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { label: "Agency Profile", path: "/agency/profile",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
];

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.agencies)) return data.agencies;
  if (data && typeof data === "object") {
    const arrProp = Object.values(data).find(v => Array.isArray(v));
    if (arrProp) return arrProp as any[];
  }
  return [];
}

export default function AgencyLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [agencyName, setAgencyName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function fetchAgencyName() {
      if (!user?.agencyId) return;
      try {
        const res = await api.get(`/agencies/${user.agencyId}`);
        const data = res.data;
        const name = data?.name || data?.data?.name || data?.agency?.name;
        if (name) { setAgencyName(name); return; }
      } catch {}
      try {
        const res = await api.get("/agencies");
        const list = extractArray(res.data);
        const found = list.find((a: any) => a.id === user.agencyId);
        if (found?.name) setAgencyName(found.name);
      } catch {}
    }
    fetchAgencyName();
  }, [user?.agencyId]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── SHARED PUBLIC NAVBAR on top ── */}
      <Navbar />

      {/* ── BODY: sidebar + content ── */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* SIDEBAR */}
        <aside style={{
          width: sidebarOpen ? '240px' : '60px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: '64px',
          height: 'calc(100vh - 64px)',
          transition: 'width 0.25s',
          overflow: 'hidden',
          flexShrink: 0,
          zIndex: 30,
        }}>

          {/* Agency name header */}
          <div style={{ padding: '16px 12px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {sidebarOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <div style={{ width: '28px', height: '28px', backgroundColor: '#1d4ed8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800' }}>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agencyName || user?.name || 'Agency'}</div>
                  <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: '600' }}>Agency Admin</div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
            {sidebarOpen && (
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px 8px', margin: 0 }}>
                Agency Panel
              </p>
            )}
            {menuItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!sidebarOpen ? item.label : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: sidebarOpen ? '10px 12px' : '10px',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: active ? '600' : '500',
                    fontSize: '13px',
                    color: active ? '#fff' : '#94a3b8',
                    backgroundColor: active ? '#1e30eb' : 'transparent',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ flexShrink: 0, color: active ? '#fff' : '#64748b' }}>{item.icon}</span>
                  {sidebarOpen && item.label}
                  {sidebarOpen && active && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', backgroundColor: '#74abfd', borderRadius: '50%', flexShrink: 0 }} />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b' }}>
            <button
              onClick={logout}
              title={!sidebarOpen ? 'Logout' : ''}
              style={{
                width: '100%',
                padding: sidebarOpen ? '10px 12px' : '10px',
                backgroundColor: 'transparent',
                color: '#f87171',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                gap: '8px',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e293b')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {sidebarOpen && 'Logout'}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <main style={{ flex: 1, padding: '24px' }}>
            {children}
          </main>
          <footer style={{ backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', padding: '14px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>© 2026 BusLink — Rwanda Smart Bus Ticketing Platform</p>
          </footer>
        </div>
      </div>
    </div>
  );
}