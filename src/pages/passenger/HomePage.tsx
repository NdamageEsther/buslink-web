import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Station {
  id: string;
  name: string;
  city?: string;
  address?: string;
}

interface Agency {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  logo?: string;
}

interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime?: string;
  price: number;
  status: string;
  availableSeats: number;
  agency: { id: string; name: string };
  bus: { plateNumber: string; busType?: string; capacity: number };
  route: {
    fromStation: { id: string; name: string; city?: string };
    toStation:   { id: string; name: string; city?: string };
    distanceKm?: number;
  };
}

type Step = "stations" | "agencies" | "schedules";

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && typeof data === "object") {
    const v = Object.values(data).find(x => Array.isArray(x));
    if (v) return v as any[];
  }
  return [];
}

export default function PassengerHomePage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [step,          setStep]          = useState<Step>("stations");
  const [stations,      setStations]      = useState<Station[]>([]);
  const [agencies,      setAgencies]      = useState<Agency[]>([]);
  const [schedules,     setSchedules]     = useState<Schedule[]>([]);
  const [selectedSt,    setSelectedSt]    = useState<Station | null>(null);
  const [selectedAg,    setSelectedAg]    = useState<Agency | null>(null);
  const [loadingSt,     setLoadingSt]     = useState(true);
  const [loadingAg,     setLoadingAg]     = useState(false);
  const [loadingSch,    setLoadingSch]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [error,         setError]         = useState("");

  // Fetch all stations on mount
  useEffect(() => {
    api.get("/stations").then(res => {
      const list: Station[] = extractArray(res.data);
      setStations(list);
    }).catch(() => setError("Failed to load stations"))
    .finally(() => setLoadingSt(false));
  }, []);

  // ── STEP 1 → STEP 2: Station selected — load agencies operating there ──────
  async function handleSelectStation(station: Station) {
    setSelectedSt(station);
    setSelectedAg(null);
    setStep("agencies");
    setLoadingAg(true);
    setAgencies([]);
    setSchedules([]);
    setError("");
    try {
      // Backend should filter agencies by AgencyStation relation for this station
      const res  = await api.get(`/agencies?stationId=${station.id}`);
      const list: Agency[] = extractArray(res.data);
      setAgencies(list);
    } catch {
      // Fallback: try the agency-stations link endpoint if /agencies doesn't support stationId filter
      try {
        const res2 = await api.get(`/agency-stations?stationId=${station.id}`);
        const links = extractArray(res2.data);
        const list: Agency[] = links
          .map((l: any) => l.agency)
          .filter(Boolean);
        setAgencies(list);
      } catch {
        setError("Failed to load agencies for this station");
      }
    } finally { setLoadingAg(false); }
  }

  // ── STEP 2 → STEP 3: Agency selected — load schedules for station + agency ─
  async function handleSelectAgency(agency: Agency) {
    setSelectedAg(agency);
    setStep("schedules");
    setLoadingSch(true);
    setSchedules([]);
    setError("");
    try {
      const res = await api.get(
        `/schedules/search?fromStationId=${selectedSt?.id}&agencyId=${agency.id}`
      );
      const list: Schedule[] = extractArray(res.data);
      setSchedules(list);
    } catch {
      setError("Failed to load routes for this agency");
    } finally { setLoadingSch(false); }
  }

  function handleBook(schedule: Schedule) {
    sessionStorage.setItem("buslink_schedule", JSON.stringify(schedule));
    navigate(`/checkout?scheduleId=${schedule.id}`);
  }

  function goToStations() {
    setStep("stations");
    setSelectedSt(null);
    setSelectedAg(null);
    setAgencies([]);
    setSchedules([]);
  }

  function goToAgencies() {
    setStep("agencies");
    setSelectedAg(null);
    setSchedules([]);
  }

  // Derived
  const filteredStations = stations.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.city || "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredAgencies = agencies.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Page header / breadcrumb */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
          <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "16px", flexWrap: "wrap" }}>
            <button onClick={goToStations}
              style={{ background: "none", border: "none", cursor: "pointer", fontWeight: step === "stations" ? "800" : "500", color: step === "stations" ? "#1e293b" : "#1d4ed8", fontSize: "16px", padding: 0 }}>
              Stations
            </button>
            {step !== "stations" && (
              <>
                <span style={{ color: "#94a3b8" }}>/</span>
                <button onClick={goToAgencies}
                  style={{ background: "none", border: "none", cursor: "pointer", fontWeight: step === "agencies" ? "800" : "500", color: step === "agencies" ? "#1e293b" : "#1d4ed8", fontSize: "16px", padding: 0 }}>
                  {selectedSt?.name}
                </button>
              </>
            )}
            {step === "schedules" && (
              <>
                <span style={{ color: "#94a3b8" }}>/</span>
                <span style={{ fontWeight: "800", color: "#1e293b" }}>{selectedAg?.name}</span>
              </>
            )}
          </div>
        </div>
        <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>
          {step === "stations" && `Welcome ${user?.name?.split(" ")[0] || ""}! Select your departure station.`}
          {step === "agencies"  && `Transport agencies operating at ${selectedSt?.name} — select one to see routes`}
          {step === "schedules" && `Available routes from ${selectedAg?.name} — select one to book`}
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
          ⚠️ {error}
          <button onClick={() => setError("")} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>✕</button>
        </div>
      )}

      {/* ── STEP 1: STATIONS ── */}
      {step === "stations" && (
        <>
          <div style={{ position: "relative", marginBottom: "20px", maxWidth: "480px" }}>
            <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stations by name or city..."
              style={{ width: "100%", paddingLeft: "40px", paddingRight: "14px", paddingTop: "11px", paddingBottom: "11px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box", backgroundColor: "#fff" }}
              onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
              onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {loadingSt ? (
            <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚉</div>
              Loading stations...
            </div>
          ) : filteredStations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
              No stations match your search
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              {filteredStations.map(station => (
                <button key={station.id} onClick={() => handleSelectStation(station)}
                  style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1.5px solid #e2e8f0", padding: "20px", textAlign: "left", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "flex-start", gap: "14px" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1d4ed8"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(29,78,216,0.1)"; e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.backgroundColor = "#fff"; }}
                >
                  <div style={{ width: "44px", height: "44px", backgroundColor: "#dbeafe", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>{station.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{station.city || "Rwanda"}</div>
                    {station.address && <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{station.address}</div>}
                    <div style={{ marginTop: "10px", fontSize: "12px", fontWeight: "600", color: "#1d4ed8" }}>Select agency →</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── STEP 2: AGENCIES ── */}
      {step === "agencies" && (
        <>
          {/* Station banner */}
          <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", borderRadius: "14px", padding: "18px 22px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "44px", height: "44px", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>{selectedSt?.name}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{selectedSt?.city || "Rwanda"}</div>
            </div>
            <button onClick={goToStations}
              style={{ padding: "7px 14px", backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
              Change Station
            </button>
          </div>

          {loadingAg ? (
            <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏢</div>
              Loading agencies...
            </div>
          ) : filteredAgencies.length === 0 ? (
            <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "56px", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "44px", marginBottom: "12px" }}>🏢</div>
              <p style={{ fontWeight: "700", margin: "0 0 6px", color: "#475569", fontSize: "16px" }}>No agencies found</p>
              <p style={{ fontSize: "13px", margin: "0 0 20px" }}>No transport companies operate from {selectedSt?.name}</p>
              <button onClick={goToStations}
                style={{ padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: "600" }}>
                ← Choose Another Station
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              {filteredAgencies.map(agency => (
                <button key={agency.id} onClick={() => handleSelectAgency(agency)}
                  style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1.5px solid #e2e8f0", padding: "22px", textAlign: "left", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: "14px" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1d4ed8"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(29,78,216,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "48px", height: "48px", backgroundColor: "#eff6ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "22px" }}>
                      🏢
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b", marginBottom: "3px" }}>{agency.name}</div>
                      {agency.phone && <div style={{ fontSize: "12px", color: "#64748b" }}>📞 {agency.phone}</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8" }}>View routes →</div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── STEP 3: SCHEDULES ── */}
      {step === "schedules" && (
        <>
          <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", borderRadius: "14px", padding: "18px 22px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ width: "44px", height: "44px", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "22px" }}>
              🏢
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>{selectedAg?.name}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>Departing from {selectedSt?.name}</div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={goToAgencies}
                style={{ padding: "7px 14px", backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                Change Agency
              </button>
              <button onClick={goToStations}
                style={{ padding: "7px 14px", backgroundColor: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                Change Station
              </button>
            </div>
          </div>

          {loadingSch ? (
            <div style={{ textAlign: "center", padding: "64px", color: "#94a3b8" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚌</div>
              Loading routes...
            </div>
          ) : schedules.length === 0 ? (
            <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "56px", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "44px", marginBottom: "12px" }}>🔍</div>
              <p style={{ fontWeight: "700", margin: "0 0 6px", color: "#475569", fontSize: "16px" }}>No routes found</p>
              <p style={{ fontSize: "13px", margin: "0 0 20px" }}>{selectedAg?.name} has no active routes from {selectedSt?.name}</p>
              <button onClick={goToAgencies}
                style={{ padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: "600" }}>
                ← Choose Another Agency
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {schedules.map(schedule => {
                const dep  = new Date(schedule.departureTime);
                const arr  = schedule.arrivalTime ? new Date(schedule.arrivalTime) : null;
                const depT = dep.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" });
                const arrT = arr ? arr.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) : "—";
                const depD = dep.toLocaleDateString("en-RW", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
                const dur  = arr ? Math.round((arr.getTime() - dep.getTime()) / 60000) : null;
                const full = schedule.availableSeats === 0;

                return (
                  <div key={schedule.id} style={{ backgroundColor: "#fff", borderRadius: "14px", border: `1.5px solid ${full ? "#f1f5f9" : "#e2e8f0"}`, padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "center", opacity: full ? 0.6 : 1, transition: "all 0.15s" }}
                    onMouseEnter={e => { if (!full) { (e.currentTarget as HTMLDivElement).style.borderColor = "#bfdbfe"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(29,78,216,0.08)"; }}}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = full ? "#f1f5f9" : "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                  >
                    <div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", backgroundColor: "#eff6ff", color: "#1d4ed8" }}>
                          🏢 {schedule.agency.name}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", backgroundColor: "#f1f5f9", color: "#475569" }}>
                          🚌 {schedule.bus.plateNumber}
                        </span>
                        {schedule.bus.busType && (
                          <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", backgroundColor: "#f1f5f9", color: "#475569" }}>
                            {schedule.bus.busType}
                          </span>
                        )}
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", backgroundColor: full ? "#fef2f2" : schedule.availableSeats <= 5 ? "#fef9c3" : "#dcfce7", color: full ? "#dc2626" : schedule.availableSeats <= 5 ? "#92400e" : "#16a34a" }}>
                          💺 {full ? "Full" : `${schedule.availableSeats} seats`}
                        </span>
                      </div>

                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>
                        {schedule.route.fromStation.name}
                        <span style={{ color: "#1d4ed8", margin: "0 10px" }}>→</span>
                        {schedule.route.toStation.name}
                      </div>

                      <div style={{ display: "flex", gap: "18px", fontSize: "13px", color: "#64748b", flexWrap: "wrap" }}>
                        <span>📅 {depD}</span>
                        <span>🕐 {depT} – {arrT}</span>
                        {dur && <span>⏱ {Math.floor(dur / 60)}h {dur % 60 > 0 ? `${dur % 60}m` : ""}</span>}
                        {schedule.route.distanceKm && <span>📍 {schedule.route.distanceKm} km</span>}
                      </div>
                    </div>

                    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#1d4ed8" }}>RWF {schedule.price.toLocaleString()}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>per seat</div>
                      </div>
                      {full ? (
                        <div style={{ padding: "10px 20px", backgroundColor: "#f1f5f9", color: "#94a3b8", borderRadius: "10px", fontWeight: "600", fontSize: "13px" }}>
                          Bus Full
                        </div>
                      ) : (
                        <button onClick={() => handleBook(schedule)}
                          style={{ padding: "12px 28px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                        >
                          Book Now →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}