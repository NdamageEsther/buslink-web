import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/shared/Navbar";

const passengerLinks = [
  { to: "/home",     label: "Bus Stations",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { to: "/bookings", label: "My Bookings",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { to: "/news",     label: "News",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg> },
  { to: "/chat",     label: "AI Chat",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { to: "/profile",  label: "My Profile",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

export default function PassengerLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {}, [location.pathname]);

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

          {/* Sidebar header — user info */}
          <div style={{ padding: '16px 12px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {sidebarOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <div style={{ width: '28px', height: '28px', backgroundColor: '#1d4ed8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800' }}>{user?.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Passenger'}</div>
                  <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: '600' }}>Passenger</div>
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
                My Dashboard
              </p>
            )}
            {passengerLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  title={!sidebarOpen ? link.label : ''}
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
                    backgroundColor: active ? '#1d4ed8' : 'transparent',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ flexShrink: 0, color: active ? '#fff' : '#64748b' }}>{link.icon}</span>
                  {sidebarOpen && link.label}
                  {sidebarOpen && active && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', backgroundColor: '#60a5fa', borderRadius: '50%', flexShrink: 0 }} />}
                </Link>
              );
            })}
          </nav>

          {/* Support + Logout */}
          <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sidebarOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 5.5 5.5l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <div>
                  <div style={{ fontSize: '9px', color: '#475569', lineHeight: 1 }}>24/7 Support</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#fff' }}>+250-788-000-000</div>
                </div>
              </div>
            )}
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