import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../../components/shared/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Station {
  id: string;
  name: string;
  city?: string;
  address?: string;
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  function fetchStations() {
    setLoading(true);
    setError('');
    api.get('/stations')
      .then(res => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data?.data ?? data?.stations ?? [];
        setStations(list);
      })
      .catch(() => setError('Failed to load bus stations. Please try again.'))
      .finally(() => setLoading(false));
  }

  function handleSelectStation(station: Station) {
    if (isAuthenticated) {
      navigate(`/home?stationId=${station.id}`);
    } else {
      navigate('/login');
    }
  }

  const filtered = stations.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '420px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)', display: 'flex', alignItems: 'flex-start', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 24px 90px', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '580px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 14px', marginBottom: '24px' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#4ade80', borderRadius: '50%' }} />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '500' }}>Online booking available 24/7</span>
            </div>
            <h1 style={{ fontSize: '52px', fontWeight: '800', color: '#fff', lineHeight: 1.1, margin: '0 0 8px' }}>Book Bus Tickets</h1>
            <h1 style={{ fontSize: '52px', fontWeight: '800', color: '#60a5fa', lineHeight: 1.1, margin: '0 0 20px' }}>Anytime, Anywhere</h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '17px', lineHeight: 1.7, margin: 0 }}>
              Find the best bus services at affordable prices and enjoy a comfortable journey across Rwanda.
            </p>
          </div>
        </div>
      </section>

      {/* BUS STATIONS LIST */}
      <div style={{ maxWidth: '1200px', margin: '-60px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', padding: '32px' }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>All Bus Stations</h2>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Select a station to start your journey across Rwanda</p>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by station or city..."
                style={{ padding: '10px 14px 10px 38px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', width: '280px', backgroundColor: '#f8fafc', color: '#1e293b' }}
                onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
              <svg style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {error}
              <button onClick={fetchStations} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: '600', fontSize: '12px', textDecoration: 'underline' }}>Retry</button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚉</div>
              Loading bus stations...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <p style={{ fontWeight: '700', margin: 0, color: '#475569' }}>
                {search ? 'No stations match your search' : 'No bus stations available yet'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {filtered.map(station => (
                <button
                  key={station.id}
                  onClick={() => handleSelectStation(station)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px',
                    padding: '18px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#1d4ed8';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(29,78,216,0.10)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ width: '44px', height: '44px', backgroundColor: '#dbeafe', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{station.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{station.city || 'Rwanda'}</div>
                    {station.address && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{station.address}</div>}
                    <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: '600', color: '#1d4ed8' }}>Select agency →</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0f172a', padding: '40px 24px', textAlign: 'center', marginTop: '80px' }}>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>© 2026 BusLink — Rwanda Smart Bus Ticketing Platform</p>
      </footer>
    </div>
  );
}