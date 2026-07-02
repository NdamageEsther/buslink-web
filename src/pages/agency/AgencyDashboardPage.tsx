import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Stats {
  totalBuses:   number;
  totalDrivers: number;
  totalRoutes:  number;
  totalBookings: number;
  revenue: number;
  activeSchedules: number;
}

export default function AgencyDashboardPage() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState<Stats>({ totalBuses: 0, totalDrivers: 0, totalRoutes: 0, totalBookings: 0, revenue: 0, activeSchedules: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [busRes, driverRes, routeRes, bookingRes] = await Promise.all([
          api.get('/buses').catch(() => ({ data: [] })),
          api.get('/drivers').catch(() => ({ data: [] })),
          api.get('/routes').catch(() => ({ data: [] })),
          api.get('/bookings').catch(() => ({ data: [] })),
        ]);

        const extract = (d: any) => {
          if (Array.isArray(d)) return d;
          return d?.data ?? d?.buses ?? d?.drivers ?? d?.routes ?? d?.bookings ?? d?.schedules ?? [];
        };

        const buses    = extract(busRes.data);
        const drivers  = extract(driverRes.data);
        const routes   = extract(routeRes.data);
        const bookings = extract(bookingRes.data);

        const revenue = bookings
          .filter((b: any) => b.status === 'CONFIRMED' || b.status === 'USED')
          .reduce((sum: number, b: any) => sum + Number(b.totalPrice || b.price || 0), 0);

        setStats({
          totalBuses:      buses.length,
          totalDrivers:    drivers.length,
          totalRoutes:     routes.length,
          totalBookings:   bookings.length,
          revenue,
          activeSchedules: 0,
        });
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      label:   'Total Buses',
      value:   loading ? '…' : stats.totalBuses.toString(),
      sub:     'Fleet registered',
      icon:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
      bg:      '#dbeafe',
      path:    '/agency/buses',
    },
    {
      label:   'Total Drivers',
      value:   loading ? '…' : stats.totalDrivers.toString(),
      sub:     'Assigned drivers',
      icon:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      bg:      '#eff6ff',
      path:    '/agency/drivers',
    },
    {
      label:   'Total Routes',
      value:   loading ? '…' : stats.totalRoutes.toString(),
      sub:     'Active routes',
      icon:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
      bg:      '#dbeafe',
      path:    '/agency/routes',
    },
    {
      label:   'Total Bookings',
      value:   loading ? '…' : stats.totalBookings.toString(),
      sub:     'All time bookings',
      icon:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      bg:      '#eff6ff',
      path:    '/agency/bookings',
    },
    {
      label:   'Revenue',
      value:   loading ? '…' : `RWF ${stats.revenue.toLocaleString()}`,
      sub:     'Confirmed bookings',
      icon:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      bg:      '#dbeafe',
      path:    '/agency/reports',
    },
    {
      label:   'Quick Links',
      value:   'Manage',
      sub:     'Schedules & reports',
      icon:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      bg:      '#eff6ff',
      path:    '/agency/schedules',
    },
  ];

  const quickLinks = [
    { label: 'Manage Buses',      path: '/agency/buses',      icon: '🚌' },
    { label: 'Manage Drivers',    path: '/agency/drivers',    icon: '👤' },
    { label: 'Manage Routes',     path: '/agency/routes',     icon: '🗺️' },
    { label: 'Manage Schedules',  path: '/agency/schedules',  icon: '🕐' },
    { label: 'View Bookings',     path: '/agency/bookings',   icon: '🎫' },
    { label: 'Reports',           path: '/agency/reports',    icon: '📊' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '4px', height: '28px', backgroundColor: '#1d4ed8', borderRadius: '2px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Agency Dashboard</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 0 14px' }}>
          Welcome back, <strong style={{ color: '#1d4ed8' }}>{user?.name || 'Agency Admin'}</strong>! Here's your agency overview.
        </p>
      </div>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '3px 12px', marginBottom: '10px' }}>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#4ade80', borderRadius: '50%' }} />
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: '500' }}>Agency Admin Panel</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 6px' }}>
            {user?.name || 'Agency Admin'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>
            Manage your fleet, routes, drivers and bookings from one place.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/agency/buses"
            style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#1d4ed8', borderRadius: '10px', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
          >
            + Add Bus
          </Link>
          <Link to="/agency/drivers"
            style={{ padding: '10px 20px', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '10px', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}
          >
            + Add Driver
          </Link>
        </div>
      </div>

      {/* Stats grid — 3 main cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {statCards.slice(0, 3).map(card => (
          <Link to={card.path} key={card.label} style={{ textDecoration: 'none' }}>
            <div
              style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(29,78,216,0.12)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{ width: '56px', height: '56px', backgroundColor: card.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <p style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, lineHeight: 1 }}>{card.value}</p>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#475569', margin: '5px 0 2px' }}>{card.label}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{card.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {statCards.slice(3).map(card => (
          <Link to={card.path} key={card.label} style={{ textDecoration: 'none' }}>
            <div
              style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(29,78,216,0.12)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{ width: '48px', height: '48px', backgroundColor: card.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <p style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: 0, lineHeight: 1 }}>{card.value}</p>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#475569', margin: '4px 0 2px' }}>{card.label}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{card.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Quick Actions</h2>
          <Link to="/agency/reports" style={{ fontSize: '12px', fontWeight: '600', color: '#1d4ed8', textDecoration: 'none' }}>
            View Reports →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {quickLinks.map(link => (
            <Link key={link.path} to={link.path}
              style={{ textDecoration: 'none', padding: '14px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <span style={{ fontSize: '20px' }}>{link.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{link.label}</span>
              <svg style={{ marginLeft: 'auto' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}