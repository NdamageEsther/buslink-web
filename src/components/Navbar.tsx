import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'SYSTEM_ADMIN';
  const isAgency = user?.role === 'AGENCY_ADMIN';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = [
    { label: 'Home',       path: '/' },
    { label: 'Prices',     path: '/prices' },
    { label: 'About',      path: '/about' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px',
              backgroundColor: '#1d4ed8',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
              Bus<span style={{ color: '#1d4ed8' }}>Link</span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="bl-desktop">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontWeight: isActive(link.path) ? '600' : '500',
                  fontSize: '15px',
                  textDecoration: 'none',
                  color: isActive(link.path) ? '#1d4ed8' : '#475569',
                  backgroundColor: isActive(link.path) ? '#eff6ff' : 'transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.color = '#1d4ed8';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(link.path)) {
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right side ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Phone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }} className="bl-desktop">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 5.5 5.5l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1 }}>24/7 Support</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', lineHeight: 1.4 }}>
                  +250-788-000-000
                </div>
              </div>
            </div>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate(isAdmin ? '/admin/dashboard' : isAgency ? '/agency/dashboard' : '/home')}
                  style={{
                    padding: '8px 16px',
                    border: '1.5px solid #1d4ed8',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#1d4ed8',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}>
                  My Panel
                </button>
                <button
                  onClick={logout}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#1d4ed8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  padding: '8px 16px',
                  border: '1.5px solid #1d4ed8',
                  borderRadius: '8px',
                  color: '#1d4ed8',
                  fontWeight: '600',
                  fontSize: '14px',
                  textDecoration: 'none',
                }}>
                  Login
                </Link>
                <Link to="/register" style={{
                  padding: '8px 20px',
                  backgroundColor: '#1d4ed8',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  textDecoration: 'none',
                }}>
                  Sign Up
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              className="bl-mobile-only"
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="#475569" strokeWidth="2" strokeLinecap="round">
                {mobileOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid #e2e8f0',
            padding: '12px 24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            backgroundColor: '#fff',
          }}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '11px 14px',
                  borderRadius: '8px',
                  fontWeight: isActive(link.path) ? '600' : '500',
                  fontSize: '15px',
                  textDecoration: 'none',
                  color: isActive(link.path) ? '#1d4ed8' : '#475569',
                  backgroundColor: isActive(link.path) ? '#eff6ff' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '12px', display: 'flex', gap: '10px' }}>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate(isAdmin ? '/admin/dashboard' : isAgency ? '/agency/dashboard' : '/home')}
                    style={{ flex: 1, padding: '10px', border: '1.5px solid #1d4ed8', borderRadius: '8px', background: 'transparent', color: '#1d4ed8', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                    My Panel
                  </button>
                  <button onClick={logout}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={{ flex: 1, padding: '10px', border: '1.5px solid #1d4ed8', borderRadius: '8px', color: '#1d4ed8', fontWeight: '600', fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
                    Login
                  </Link>
                  <Link to="/register" style={{ flex: 1, padding: '10px', backgroundColor: '#1d4ed8', color: '#fff', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .bl-desktop { display: none !important; }
          .bl-mobile-only { display: flex !important; }
        }
        @media (min-width: 901px) {
          .bl-mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
}