import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Station {
  id: string;
  name: string;
  city?: string;
  location?: string;
}

const DEMO_STATIONS: Station[] = [
  { id: '1', name: 'Nyabugogo Bus Terminal', city: 'Kigali' },
  { id: '2', name: 'Huye Bus Station', city: 'Butare' },
  { id: '3', name: 'Musanze Bus Park', city: 'Musanze' },
  { id: '4', name: 'Rubavu Bus Terminal', city: 'Gisenyi' },
  { id: '5', name: 'Rusizi Bus Station', city: 'Cyangugu' },
];

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'passenger' | 'admin' | 'driver'>('passenger');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState('1');
  const [stations, setStations] = useState<Station[]>(DEMO_STATIONS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    api.get('/stations').then(res => {
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.data ?? data?.stations ?? [];
      if (list.length > 0) setStations(list.slice(0, 5));
    }).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'SYSTEM_ADMIN';
  const isAgency = user?.role === 'AGENCY_ADMIN';

  function swapLocations() {
    setFrom(to);
    setTo(from);
  }

  function handleSearch() {
    navigate(isAuthenticated ? '/home' : '/login');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#1d4ed8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Desktop Nav */}
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="desktop-nav">
            <a href="#" style={{ color: '#1d4ed8', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}>Home</a>
            <a href="#search" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Book Ticket</a>
            <a onClick={() => navigate(isAuthenticated ? '/bookings' : '/login')} style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none', cursor: 'pointer' }}>My Bookings</a>
            <a href="#features" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>Features</a>
            <a href="#about" style={{ color: '#475569', fontWeight: '500', fontSize: '15px', textDecoration: 'none' }}>About</a>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Support number */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }} className="desktop-nav">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 5.5 5.5l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1 }}>24/7 Support</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', lineHeight: 1.4 }}>+250-788-000-000</div>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate(isAdmin ? '/admin/dashboard' : isAgency ? '/agency/dashboard' : '/home')}
                  style={{ padding: '8px 16px', border: '1.5px solid #1d4ed8', borderRadius: '8px', background: 'transparent', color: '#1d4ed8', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                  My Panel
                </button>
                <button onClick={logout}
                  style={{ padding: '8px 20px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ padding: '8px 16px', border: '1.5px solid #1d4ed8', borderRadius: '8px', color: '#1d4ed8', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
                  Login
                </Link>
                <Link to="/register" style={{ padding: '8px 20px', backgroundColor: '#1d4ed8', color: '#fff', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              className="mobile-only"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
                {mobileOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#fff' }}>
            <a href="#" style={{ color: '#1d4ed8', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}>Home</a>
            <a href="#search" style={{ color: '#475569', fontSize: '15px', textDecoration: 'none' }}>Book Ticket</a>
            <a onClick={() => navigate(isAuthenticated ? '/bookings' : '/login')} style={{ color: '#475569', fontSize: '15px', textDecoration: 'none', cursor: 'pointer' }}>My Bookings</a>
            <a href="#features" style={{ color: '#475569', fontSize: '15px', textDecoration: 'none' }}>Features</a>
            <a href="#about" style={{ color: '#475569', fontSize: '15px', textDecoration: 'none' }}>About</a>
            {!isAuthenticated && (
              <Link to="/login" style={{ color: '#475569', fontSize: '15px', textDecoration: 'none' }}>Login</Link>
            )}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{
        position: 'relative',
        minHeight: '500px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.25))', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 24px 130px', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '580px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 14px', marginBottom: '24px' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#4ade80', borderRadius: '50%' }} />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '500' }}>Online booking available 24/7</span>
            </div>
            <h1 style={{ fontSize: '54px', fontWeight: '800', color: '#fff', lineHeight: 1.1, margin: '0 0 8px' }}>
              Book Bus Tickets
            </h1>
            <h1 style={{ fontSize: '54px', fontWeight: '800', color: '#60a5fa', lineHeight: 1.1, margin: '0 0 20px' }}>
              Anytime, Anywhere
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '17px', lineHeight: 1.7, margin: 0 }}>
              Find the best bus services at affordable prices and enjoy a comfortable journey across Rwanda.
            </p>
          </div>
        </div>

        {/* Decorative bus */}
        <div style={{ position: 'absolute', right: 0, bottom: '70px', opacity: 0.15, pointerEvents: 'none' }}>
          <svg width="500" height="210" viewBox="0 0 500 210" fill="none">
            <rect x="20" y="40" width="440" height="130" rx="20" fill="white"/>
            <rect x="40" y="20" width="380" height="130" rx="16" fill="white"/>
            <rect x="60" y="38" width="56" height="48" rx="4" fill="#1d4ed8"/>
            <rect x="134" y="38" width="56" height="48" rx="4" fill="#1d4ed8"/>
            <rect x="208" y="38" width="56" height="48" rx="4" fill="#1d4ed8"/>
            <rect x="282" y="38" width="56" height="48" rx="4" fill="#1d4ed8"/>
            <circle cx="95" cy="168" r="28" fill="#334155"/>
            <circle cx="95" cy="168" r="14" fill="#94a3b8"/>
            <circle cx="345" cy="168" r="28" fill="#334155"/>
            <circle cx="345" cy="168" r="14" fill="#94a3b8"/>
          </svg>
        </div>
      </section>

      {/* SEARCH BOX — overlaps hero */}
      <div id="search" style={{ maxWidth: '1100px', margin: '-60px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>

            {/* From */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <input
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  placeholder="Leaving from"
                  style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '11px', paddingBottom: '11px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Swap */}
            <div style={{ paddingBottom: '1px' }}>
              <button onClick={swapLocations} style={{ width: '40px', height: '43px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
              </button>
            </div>

            {/* To */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <input
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  placeholder="Going to"
                  style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '11px', paddingBottom: '11px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date of journey</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '11px', paddingBottom: '11px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Passengers */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Passengers</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <select
                  value={passengers}
                  onChange={e => setPassengers(e.target.value)}
                  style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '11px', paddingBottom: '11px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div style={{ paddingBottom: '1px' }}>
              <button
                onClick={handleSearch}
                style={{ whiteSpace: 'nowrap', padding: '11px 24px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', height: '43px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e40af')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Search Buses
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* TRUST BADGES */}
      <section id="features" style={{ maxWidth: '1100px', margin: '36px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {[
            { icon: '🛡️', bg: '#dbeafe', title: 'Safe & Secure', sub: 'Your safety is our priority' },
            { icon: '💰', bg: '#dcfce7', title: 'Best Price Guarantee', sub: 'Get the best deals always' },
            { icon: '🎧', bg: '#ede9fe', title: '24/7 Support', sub: "We're here to help you" },
            { icon: '⚡', bg: '#fef3c7', title: 'Easy Booking', sub: 'Quick and hassle-free' },
          ].map((badge, i) => (
            <div key={i} style={{ backgroundColor: '#fff', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: badge.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {badge.icon}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{badge.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BUS STATIONS + ABOUT */}
      <section style={{ maxWidth: '1100px', margin: '28px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Bus Stations */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Bus Stations</h2>
            <button
              onClick={() => navigate(isAuthenticated ? '/home' : '/login')}
              style={{ fontSize: '13px', fontWeight: '600', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              View All Stations →
            </button>
          </div>
          {stations.map((station, i) => (
            <div
              key={station.id}
              onClick={() => navigate(isAuthenticated ? '/home' : '/login')}
              style={{ padding: '13px 24px', borderBottom: i < stations.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{station.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{station.city || station.location || 'Rwanda'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* About Us */}
        <div id="about" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>About Us</h2>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: '0 0 14px' }}>
            BusLink is Rwanda's intelligent bus ticketing and transport management platform. We connect passengers and transport companies in one smart system — making bus travel easier, faster, and more reliable for everyone.
          </p>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: '0 0 24px' }}>
            Book tickets online, pay with Mobile Money or card, and board with a QR code. No more queuing at bus stations.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
            {[
              { icon: '🚌', value: '200+', label: 'Routes' },
              { icon: '🏢', value: '50+', label: 'Bus Operators' },
              { icon: '👥', value: '10K+', label: 'Happy Passengers' },
              { icon: '🎧', value: '24/7', label: 'Customer Support' },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '14px 8px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontSize: '17px', fontWeight: '800', color: '#1d4ed8', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES TABS */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 32px', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Platform Features</p>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Built for every role in the journey.</h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px', maxWidth: '560px' }}>Buslink serves passengers booking tickets, operators managing fleets, and drivers validating boarding — each with a purpose-built interface.</p>

          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[
              { key: 'passenger', label: 'Passenger', count: 8 },
              { key: 'admin', label: 'Admin', count: 8 },
              { key: 'driver', label: 'Driver / Conductor', count: 6 },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  backgroundColor: activeTab === t.key ? '#1d4ed8' : '#f1f5f9',
                  color: activeTab === t.key ? '#fff' : '#475569',
                }}
              >
                {t.label}
                <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '20px', backgroundColor: activeTab === t.key ? 'rgba(255,255,255,0.2)' : '#e2e8f0', color: activeTab === t.key ? '#fff' : '#64748b' }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Dynamic tab panel */}
            <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '28px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
                {activeTab === 'passenger' ? 'Passenger Portal' : activeTab === 'admin' ? 'Admin Portal' : 'Driver / Conductor'}
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px' }}>
                {activeTab === 'passenger' ? 'Web & mobile app for travellers' : activeTab === 'admin' ? 'Full platform management' : 'On-board management tools'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {(activeTab === 'passenger'
                  ? ['Registration & secure login', 'Search routes by origin & destination', 'View live schedules & availability', 'Mobile Money & card payments', 'Digital QR-code e-tickets', 'Full booking history & receipts', 'Seat selection', 'AI chatbot support 24/7']
                  : activeTab === 'admin'
                  ? ['Manage all agencies & operators', 'Monitor bookings in real-time', 'Station & route management', 'User management & roles', 'Revenue & analytics reports', 'Fraud detection alerts', 'System configuration', 'AI-powered insights']
                  : ['QR code ticket scanning', 'View passenger manifest', 'Mark boarding status', 'Report delays or issues', 'Real-time schedule updates', 'Trip completion reports']
                ).map((f, i, arr) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #1e293b' : 'none' }}>
                    <div style={{ width: '28px', height: '28px', backgroundColor: '#1e293b', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#1d4ed8', fontSize: '12px', fontWeight: '700' }}>✓</span>
                    </div>
                    <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right card */}
            <div style={{ backgroundColor: '#1d4ed8', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', lineHeight: 1.1, marginBottom: '12px' }}>
                Book in under 3 minutes.
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
                Search, select, pay, and receive your QR ticket — faster than joining the queue at any station.
              </p>
              <button
                onClick={() => navigate(isAuthenticated ? '/home' : '/register')}
                style={{ alignSelf: 'flex-start', padding: '10px 20px', backgroundColor: '#fff', color: '#1d4ed8', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Get Started →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ maxWidth: '1100px', margin: '0 auto 32px', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Passenger Journey</p>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: '0 0 28px' }}>From search to boarding in four steps.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { step: '01', title: 'Search Route', desc: 'Enter origin, destination, and travel date to see available buses.' },
              { step: '02', title: 'Select & Reserve', desc: 'Pick your preferred bus and departure time, confirm in seconds.' },
              { step: '03', title: 'Pay Digitally', desc: 'Pay via Mobile Money or card — encrypted and fraud-screened.' },
              { step: '04', title: 'Board with QR', desc: 'Get your QR ticket instantly. Scan and board — no paper needed.' },
            ].map(s => (
              <div key={s.step} style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#1d4ed8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>{s.step}</span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      

      {/* CTA BANNER */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 40px', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#1d4ed8', borderRadius: '16px', padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 6px' }}>Ready to modernise Rwanda's transport?</h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '15px', margin: 0 }}>Join thousands of passengers booking smarter every day with BusLink.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            <Link to="/register" style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#1d4ed8', borderRadius: '10px', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>
              Get Started Free
            </Link>
            <Link to="/login" style={{ padding: '12px 24px', border: '2px solid rgba(255,255,255,0.35)', color: '#fff', borderRadius: '10px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0f172a', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#1d4ed8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '17px' }}>BusLink</span>
          </div>
          <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>© 2026 BusLink — Intelligent Bus Ticketing & Transport Management System</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-only { display: none !important; }
        }
      `}</style>

    </div>
  );
}