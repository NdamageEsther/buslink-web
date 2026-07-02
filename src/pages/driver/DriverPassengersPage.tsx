import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

interface Booking {
  id: string;
  status: string;
  passenger?: { name?: string; phone?: string };
  ticket?: { isValidated: boolean };
  schedule?: {
    departureTime?: string;
    arrivalTime?: string;
    status?: string;
    bus?: { plateNumber?: string };
    route?: { fromStation?: { name: string }; toStation?: { name: string } };
  };
}

interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime?: string;
  status?: string;
  bus?: { plateNumber?: string };
  route?: { fromStation?: { name: string }; toStation?: { name: string } };
  bookings?: Booking[];
}

function getTripStatus(s: Schedule): "COMPLETED" | "IN_PROGRESS" | "UPCOMING" {
  const now = new Date();
  const dep = new Date(s.departureTime);
  const arr = s.arrivalTime ? new Date(s.arrivalTime) : null;
  const st  = s.status?.toUpperCase();
  if (st === "ARRIVED" || st === "COMPLETED") return "COMPLETED";
  if (st === "DEPARTED" || st === "BOARDING" || st === "IN_PROGRESS") return "IN_PROGRESS";
  if (arr && now > arr) return "COMPLETED";
  if (now >= dep) return "IN_PROGRESS";
  return "UPCOMING";
}

export default function DriverPassengersPage() {
  const { scheduleId } = useParams<{ scheduleId?: string }>();
  const [trips,      setTrips]      = useState<Schedule[]>([]);
  const [passengers, setPassengers] = useState<Booking[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [scanning,   setScanning]   = useState(false);
  const [scanCode,   setScanCode]   = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTrip, setActiveTrip] = useState<Schedule | null>(null);
  const [filter,     setFilter]     = useState<"ALL" | "SCANNED" | "NOT_SCANNED">("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await api.get("/drivers/trips/my");
      const data = res.data;
      const list: Schedule[] = Array.isArray(data) ? data
        : Array.isArray(data?.trips) ? data.trips : [];
      setTrips(list);

      if (scheduleId) {
        // Fetch passengers for specific trip
        const pRes  = await api.get(`/drivers/trips/${scheduleId}/passengers`);
        const pData = pRes.data;
        const pList: Booking[] = Array.isArray(pData) ? pData
          : Array.isArray(pData?.passengers) ? pData.passengers
          : Array.isArray(pData?.bookings)   ? pData.bookings : [];
        setPassengers(pList);
        const trip = list.find(t => t.id === scheduleId) || null;
        setActiveTrip(trip);
      } else {
        // Show all passengers from all trips
        const allPass: Booking[] = list.flatMap(t =>
          (t.bookings || []).map(b => ({ ...b, schedule: t }))
        );
        setPassengers(allPass);
      }
    } catch { setPassengers([]); }
    finally { setLoading(false); }
  }, [scheduleId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!scanCode.trim()) return;
    setScanning(true); setScanResult(null);
    try {
      const res = await api.post("/tickets/validate", { qrCode: scanCode.trim() });
      setScanResult({ success: true, message: res.data?.message || "Ticket validated successfully!" });
      setScanCode("");
      fetchData(); // refresh passenger list
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid ticket code";
      setScanResult({ success: false, message: msg });
    } finally { setScanning(false); }
  }

  // Filter passengers
  const filtered = passengers.filter(p => {
    if (filter === "SCANNED")     return p.ticket?.isValidated;
    if (filter === "NOT_SCANNED") return !p.ticket?.isValidated;
    return true;
  });

  // Group by trip status for display
  const scannedPass    = passengers.filter(p => p.ticket?.isValidated);
  const notScannedPass = passengers.filter(p => !p.ticket?.isValidated);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
              {activeTrip
                ? `${activeTrip.route?.fromStation?.name || "—"} → ${activeTrip.route?.toStation?.name || "—"}`
                : "All Passengers"}
            </h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>
            {activeTrip
              ? `Bus: ${activeTrip.bus?.plateNumber || "—"} · ${new Date(activeTrip.departureTime).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" })}`
              : "Passengers across all your trips today"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {scheduleId && (
            <Link to="/driver/passengers"
              style={{ padding: "9px 16px", border: "1.5px solid #e2e8f0", borderRadius: "10px", color: "#475569", fontWeight: "600", fontSize: "13px", textDecoration: "none", backgroundColor: "#fff" }}
            >
              ← All Passengers
            </Link>
          )}
          <button onClick={fetchData}
            style={{ padding: "9px 18px", backgroundColor: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer", color: "#1d4ed8" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
          >🔄 Refresh</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>

        {/* Passengers Table */}
        <div>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
            {[
              { label: "Total Passengers", value: passengers.length, bg: "#dbeafe", color: "#1d4ed8" },
              { label: "Tickets Scanned",  value: scannedPass.length, bg: "#dcfce7", color: "#16a34a" },
              { label: "Not Scanned",      value: notScannedPass.length, bg: "#fef9c3", color: "#92400e" },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", backgroundColor: s.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  {s.label === "Total Passengers" ? "👥" : s.label === "Tickets Scanned" ? "✅" : "⏳"}
                </div>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {(["ALL", "SCANNED", "NOT_SCANNED"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "7px 16px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s",
                  backgroundColor: filter === f ? "#1d4ed8" : "#f1f5f9",
                  color: filter === f ? "#fff" : "#475569",
                }}>
                {f === "ALL" ? `All (${passengers.length})` : f === "SCANNED" ? `Scanned (${scannedPass.length})` : `Not Scanned (${notScannedPass.length})`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>👥</div>
                Loading passengers...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>👥</div>
                <p style={{ fontWeight: "600", margin: 0 }}>No passengers found</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    {["Passenger", "Bus", "Route", "Departure", "Ticket Status", "Trip Status"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const trip       = (p as any).schedule as Schedule | undefined;
                    const tripSt     = trip ? getTripStatus(trip) : "UPCOMING";
                    const tripStyle  = { COMPLETED: { bg: "#dcfce7", color: "#16a34a", label: "Completed" }, IN_PROGRESS: { bg: "#dbeafe", color: "#1d4ed8", label: "In Progress" }, UPCOMING: { bg: "#fef9c3", color: "#92400e", label: "Upcoming" } }[tripSt];
                    const isScanned  = p.ticket?.isValidated;
                    const busPlate   = trip?.bus?.plateNumber || activeTrip?.bus?.plateNumber || "—";
                    const from       = trip?.route?.fromStation?.name || activeTrip?.route?.fromStation?.name || "—";
                    const to         = trip?.route?.toStation?.name   || activeTrip?.route?.toStation?.name   || "—";
                    const depTime    = trip?.departureTime || activeTrip?.departureTime;
                    const dep        = depTime ? new Date(depTime).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) : "—";

                    return (
                      <tr key={p.id || i} style={{ borderBottom: "1px solid #f1f5f9" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ fontWeight: "700", color: "#1e293b" }}>{p.passenger?.name || "—"}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.passenger?.phone || ""}</div>
                        </td>
                        <td style={{ padding: "13px 16px", color: "#475569", fontWeight: "500", fontSize: "12px" }}>{busPlate}</td>
                        <td style={{ padding: "13px 16px", color: "#64748b", fontSize: "12px" }}>{from} → {to}</td>
                        <td style={{ padding: "13px 16px", color: "#64748b", fontSize: "12px" }}>{dep}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px",
                            backgroundColor: isScanned ? "#dcfce7" : "#fef2f2",
                            color: isScanned ? "#16a34a" : "#dc2626",
                          }}>
                            {isScanned ? "✅ Scanned" : "⏳ Not Scanned"}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", backgroundColor: tripStyle.bg, color: tripStyle.color }}>
                            {tripStyle.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Scan Ticket Panel */}
        <div style={{ position: "sticky", top: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
              🎫 Scan Ticket
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
              Enter the ticket QR code to validate a passenger's ticket.
            </p>

            {scanResult && (
              <div style={{
                backgroundColor: scanResult.success ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${scanResult.success ? "#bbf7d0" : "#fecaca"}`,
                color: scanResult.success ? "#16a34a" : "#dc2626",
                fontSize: "13px", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px",
              }}>
                {scanResult.success ? "✅" : "❌"} {scanResult.message}
              </div>
            )}

            <form onSubmit={handleScan} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Ticket Code / QR Code
                </label>
                <input
                  value={scanCode}
                  onChange={e => setScanCode(e.target.value)}
                  placeholder="e.g. BL00A1B2"
                  style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box", backgroundColor: "#f8fafc", fontFamily: "monospace", letterSpacing: "0.05em" }}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={scanning || !scanCode.trim()}
                style={{ width: "100%", padding: "13px", backgroundColor: scanning || !scanCode.trim() ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: scanning || !scanCode.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onMouseEnter={e => { if (!scanning && scanCode.trim()) e.currentTarget.style.backgroundColor = "#1e40af"; }}
                onMouseLeave={e => { if (!scanning && scanCode.trim()) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/>
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                  <path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>
                </svg>
                {scanning ? "Validating..." : "Verify Ticket"}
              </button>
            </form>

            {/* Instructions */}
            <div style={{ marginTop: "20px", padding: "14px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>How to scan:</div>
              <ol style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#64748b", lineHeight: 2 }}>
                <li>Ask passenger to show their QR code ticket</li>
                <li>Type or scan the code above</li>
                <li>Click "Verify Ticket"</li>
                <li>Status updates instantly in the table</li>
              </ol>
            </div>
          </div>

          {/* Trip selector if no specific trip */}
          {!scheduleId && trips.length > 0 && (
            <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", marginTop: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: "0 0 12px" }}>View by Trip</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {trips.map(t => {
                  const from = t.route?.fromStation?.name || "—";
                  const to   = t.route?.toStation?.name   || "—";
                  const dep  = new Date(t.departureTime).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <Link key={t.id} to={`/driver/passengers/${t.id}`}
                      style={{ padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: "9px", border: "1px solid #e2e8f0", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{from} → {to}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{dep} · {t.bus?.plateNumber || "—"}</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}