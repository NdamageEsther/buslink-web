import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

interface Schedule {
  id: string; departureTime: string; arrivalTime?: string; price?: number;
  availableSeats?: number; status?: string;
  bus?: { plateNumber: string; capacity: number };
  agency?: { name: string };
  route?: { fromStation?: { name: string }; toStation?: { name: string }; agency?: { name: string } };
}

const DEMO_SCHEDULES: Schedule[] = [
  { id: "demo-1", departureTime: new Date(Date.now() + 2 * 3600000).toISOString(), arrivalTime: new Date(Date.now() + 4 * 3600000).toISOString(), price: 2500, availableSeats: 32, status: "ACTIVE", bus: { plateNumber: "RAC 001 A", capacity: 45 }, agency: { name: "YAHOO Transport" }, route: { fromStation: { name: "Kigali" }, toStation: { name: "Butare" } } },
  { id: "demo-2", departureTime: new Date(Date.now() + 3 * 3600000).toISOString(), arrivalTime: new Date(Date.now() + 6 * 3600000).toISOString(), price: 3000, availableSeats: 20, status: "ACTIVE", bus: { plateNumber: "RAB 002 B", capacity: 35 }, agency: { name: "Volcano Express" }, route: { fromStation: { name: "Kigali" }, toStation: { name: "Musanze" } } },
  { id: "demo-3", departureTime: new Date(Date.now() + 1 * 3600000).toISOString(), arrivalTime: new Date(Date.now() + 3 * 3600000).toISOString(), price: 1500, availableSeats: 15, status: "ACTIVE", bus: { plateNumber: "RAD 003 C", capacity: 30 }, agency: { name: "Horizon Express" }, route: { fromStation: { name: "Butare" }, toStation: { name: "Kigali" } } },
  { id: "demo-4", departureTime: new Date(Date.now() + 5 * 3600000).toISOString(), arrivalTime: new Date(Date.now() + 8 * 3600000).toISOString(), price: 4000, availableSeats: 28, status: "ACTIVE", bus: { plateNumber: "RAE 004 D", capacity: 50 }, agency: { name: "Kigali Coach" }, route: { fromStation: { name: "Kigali" }, toStation: { name: "Gisenyi" } } },
  { id: "demo-5", departureTime: new Date(Date.now() + 4 * 3600000).toISOString(), arrivalTime: new Date(Date.now() + 7 * 3600000).toISOString(), price: 3500, availableSeats: 10, status: "ACTIVE", bus: { plateNumber: "RAF 005 E", capacity: 45 }, agency: { name: "Volcano Express" }, route: { fromStation: { name: "Musanze" }, toStation: { name: "Gisenyi" } } },
  { id: "demo-6", departureTime: new Date(Date.now() + 6 * 3600000).toISOString(), arrivalTime: new Date(Date.now() + 9 * 3600000).toISOString(), price: 2000, availableSeats: 40, status: "ACTIVE", bus: { plateNumber: "RAG 006 F", capacity: 50 }, agency: { name: "YAHOO Transport" }, route: { fromStation: { name: "Kigali" }, toStation: { name: "Nyamagabe" } } },
];

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.schedules)) return data.schedules;
  if (data && typeof data === "object") { const v = Object.values(data).find(x => Array.isArray(x)); if (v) return v as any[]; }
  return [];
}

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const from = params.get("from") || "";
  const to   = params.get("to")   || "";
  const date = params.get("date") || "";
  const [all, setAll] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"price" | "time">("time");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await api.get("/schedules");
        const data = extractArray(res.data);
        setAll(data.length > 0 ? data : DEMO_SCHEDULES);
      } catch { setAll(DEMO_SCHEDULES); }
      setLoading(false);
    }
    fetchData();
  }, []);
const filtered = all
    .filter(s => {
      const fromLower   = from.toLowerCase().trim();
      const toLower     = to.toLowerCase().trim();
      const stationFrom = (s.route?.fromStation?.name || s.fromStation?.name || '').toLowerCase();
      const stationTo   = (s.route?.toStation?.name   || s.toStation?.name   || '').toLowerCase();

      // Match both ways: "Huye" matches "HUYE bus station" and vice versa
      const fromMatch = !fromLower || stationFrom.includes(fromLower) || fromLower.includes(stationFrom);
      const toMatch   = !toLower   || stationTo.includes(toLower)     || toLower.includes(stationTo);

      // Compare only the date part (YYYY-MM-DD) ignoring time
      const scheduleDate = s.departureTime ? s.departureTime.slice(0, 10) : '';
      const dateMatch    = !date || scheduleDate === date;

      return fromMatch && toMatch && dateMatch && s.status !== 'CANCELLED';
    })
    .sort((a, b) => sortBy === "price"
      ? (a.price || 0) - (b.price || 0)
      : new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
    );

  const fmtTime = (dt: string) => { try { return new Date(dt).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }); } catch { return "—"; } };
  const fmtDate = (dt: string) => { try { return new Date(dt).toLocaleDateString("en-RW", { dateStyle: "medium" }); } catch { return "—"; } };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate("/home")}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#1d4ed8', fontWeight: '600', fontSize: '14px', cursor: 'pointer', padding: 0, marginBottom: '14px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Search
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            {from && to ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{from}</span>
                <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                  <line x1="0" y1="8" x2="24" y2="8" stroke="#1d4ed8" strokeWidth="2"/>
                  <path d="M20 3l8 5-8 5" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{to}</span>
              </div>
            ) : (
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px' }}>All Available Buses</h1>
            )}
            {date && (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {fmtDate(date)}
              </p>
            )}
          </div>

          {!loading && filtered.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>SORT:</span>
              {(['time', 'price'] as const).map(s => (
                <button key={s}
                  onClick={() => setSortBy(s)}
                  style={{ padding: '5px 12px', borderRadius: '7px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', backgroundColor: sortBy === s ? '#1d4ed8' : 'transparent', color: sortBy === s ? '#fff' : '#64748b', transition: 'all 0.15s' }}
                >
                  {s === 'time' ? '🕐 Earliest' : '💰 Cheapest'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚌</div>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Searching for buses...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>No buses found</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>Try a different route or date</p>
          <button onClick={() => navigate('/home')} style={{ padding: '12px 28px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
            Search Again
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            <span style={{ fontWeight: '700', color: '#1d4ed8' }}>{filtered.length}</span> bus{filtered.length !== 1 ? 'es' : ''} available
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(s => {
              const agencyName = s.agency?.name || s.route?.agency?.name;
              const seatsLeft  = s.availableSeats ?? s.bus?.capacity ?? 0;
              const seatsColor = seatsLeft <= 10 ? '#ef4444' : seatsLeft <= 20 ? '#f59e0b' : '#22c55e';

              return (
                <div key={s.id} style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(29,78,216,0.1)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  {/* Agency + plate */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {agencyName && (
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '20px' }}>
                          🏢 {agencyName}
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '3px 10px', borderRadius: '20px' }}>
                        🚌 {s.bus?.plateNumber || 'Bus'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: seatsColor, backgroundColor: seatsColor + '15', padding: '3px 10px', borderRadius: '20px' }}>
                      💺 {seatsLeft} seats left
                    </span>
                  </div>

                  {/* Main content */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>

                    {/* Times */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, lineHeight: 1 }}>{fmtTime(s.departureTime)}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', fontWeight: '600' }}>{s.route?.fromStation?.name || from}</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '28px', height: '2px', backgroundColor: '#e2e8f0' }} />
                          <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🚌</div>
                          <div style={{ width: '28px', height: '2px', backgroundColor: '#e2e8f0' }} />
                        </div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>DIRECT</span>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, lineHeight: 1 }}>{s.arrivalTime ? fmtTime(s.arrivalTime) : '—'}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0', fontWeight: '600' }}>{s.route?.toStation?.name || to}</p>
                      </div>
                    </div>

                    {/* Price + Book */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '26px', fontWeight: '800', color: '#1d4ed8', margin: 0, lineHeight: 1 }}>
                          {s.price ? `RWF ${Number(s.price).toLocaleString()}` : '—'}
                        </p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>per seat</p>
                      </div>
                      <button
                        onClick={() => navigate(`/checkout/${s.id}`)}
                        style={{ padding: '11px 24px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background-color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e40af')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"/><path d="M16 2l4 4-8 8H8v-4l8-8z"/></svg>
                        Book This Bus
                      </button>
                    </div>
                  </div>

                  {/* Date footer */}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{fmtDate(s.departureTime)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}