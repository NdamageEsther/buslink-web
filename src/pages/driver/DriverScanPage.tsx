import { useState, useEffect, useRef } from "react";
import api from "../../services/api";

interface ScanResult {
  valid: boolean;
  message: string;
  passenger?: string;
  route?: string;
  bus?: string;
  departure?: string;
}

export default function DriverScanPage() {
  const [code,      setCode]      = useState("");
  const [scanning,  setScanning]  = useState(false);
  const [result,    setResult]    = useState<ScanResult | null>(null);
  const [history,   setHistory]   = useState<(ScanResult & { code: string; time: string })[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setScanning(true); setResult(null);
    try {
      const res  = await api.post("/tickets/validate", { qrCode: code.trim() });
      const data = res.data;
      const r: ScanResult = {
        valid:     true,
        message:   data.message || "Ticket valid — passenger may board",
        passenger: data.passenger?.name || data.booking?.passenger?.name,
        route:     data.route || data.booking?.schedule?.route
          ? `${data.booking?.schedule?.route?.fromStation?.name} → ${data.booking?.schedule?.route?.toStation?.name}`
          : undefined,
        bus:       data.bus || data.booking?.schedule?.bus?.plateNumber,
        departure: data.booking?.schedule?.departureTime
          ? new Date(data.booking.schedule.departureTime).toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" })
          : undefined,
      };
      setResult(r);
      setHistory(prev => [{ ...r, code: code.trim(), time: new Date().toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) }, ...prev.slice(0, 9)]);
      setCode("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid or already used ticket";
      const r: ScanResult = { valid: false, message: msg };
      setResult(r);
      setHistory(prev => [{ ...r, code: code.trim(), time: new Date().toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) }, ...prev.slice(0, 9)]);
    } finally {
      setScanning(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Scan Ticket</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 0 14px" }}>Validate passenger QR code tickets before boarding</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>

        {/* Scanner */}
        <div>
          {/* Scan input card */}
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", marginBottom: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "80px", height: "80px", backgroundColor: "#eff6ff", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "36px" }}>
                📱
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 6px" }}>Verify Ticket</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Enter or scan the passenger's QR code ticket</p>
            </div>

            {/* Result */}
            {result && (
              <div style={{
                backgroundColor: result.valid ? "#f0fdf4" : "#fef2f2",
                border: `1.5px solid ${result.valid ? "#86efac" : "#fca5a5"}`,
                borderRadius: "12px", padding: "16px", marginBottom: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", backgroundColor: result.valid ? "#dcfce7" : "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                    {result.valid ? "✅" : "❌"}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: result.valid ? "#16a34a" : "#dc2626", marginBottom: "4px" }}>
                      {result.valid ? "Ticket Valid — Passenger May Board" : "Invalid Ticket"}
                    </div>
                    <div style={{ fontSize: "13px", color: result.valid ? "#15803d" : "#b91c1c" }}>{result.message}</div>
                    {result.passenger && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>👤 {result.passenger}</div>}
                    {result.route && <div style={{ fontSize: "12px", color: "#64748b" }}>🗺️ {result.route}</div>}
                    {result.bus && <div style={{ fontSize: "12px", color: "#64748b" }}>🚌 Bus: {result.bus}</div>}
                    {result.departure && <div style={{ fontSize: "12px", color: "#64748b" }}>🕐 Departure: {result.departure}</div>}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleScan} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Ticket QR Code
                </label>
                <input
                  ref={inputRef}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Scan QR or type ticket code e.g. BL00A1B2"
                  style={{ width: "100%", padding: "14px 16px", border: "2px solid #e2e8f0", borderRadius: "12px", fontSize: "15px", color: "#1e293b", outline: "none", boxSizing: "border-box", backgroundColor: "#f8fafc", fontFamily: "monospace", letterSpacing: "0.05em" }}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                  autoComplete="off"
                />
              </div>
              <button type="submit" disabled={scanning || !code.trim()}
                style={{ width: "100%", padding: "14px", backgroundColor: scanning || !code.trim() ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: scanning || !code.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                onMouseEnter={e => { if (!scanning && code.trim()) e.currentTarget.style.backgroundColor = "#1e40af"; }}
                onMouseLeave={e => { if (!scanning && code.trim()) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/>
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                </svg>
                {scanning ? "Verifying..." : "Verify Ticket"}
              </button>
            </form>
          </div>

          {/* Instructions */}
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: "0 0 14px" }}>📋 How to scan tickets</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { step: "01", text: "Ask the passenger to show their BusLink QR ticket on their phone" },
                { step: "02", text: "Use a QR scanner or type the ticket code shown below the QR code" },
                { step: "03", text: "Click 'Verify Ticket' — a green result means the passenger may board" },
                { step: "04", text: "A red result means the ticket is invalid or already used — do not allow boarding" },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "28px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontSize: "11px", fontWeight: "700" }}>{s.step}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: 1.6 }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scan History */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
              Recent Scans
            </h3>
            {history.length > 0 && (
              <button onClick={() => setHistory([])}
                style={{ fontSize: "12px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎫</div>
              <p style={{ fontWeight: "600", margin: "0 0 4px" }}>No scans yet</p>
              <p style={{ fontSize: "13px", margin: 0 }}>Scanned tickets will appear here</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {history.map((h, i) => (
                <div key={i} style={{ padding: "14px 20px", borderBottom: i < history.length - 1 ? "1px solid #f1f5f9" : "none", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", backgroundColor: h.valid ? "#dcfce7" : "#fef2f2", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                    {h.valid ? "✅" : "❌"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", fontFamily: "monospace" }}>{h.code}</div>
                    <div style={{ fontSize: "12px", color: h.valid ? "#16a34a" : "#dc2626", marginTop: "2px" }}>{h.message}</div>
                    {h.passenger && <div style={{ fontSize: "11px", color: "#64748b" }}>{h.passenger}</div>}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", flexShrink: 0 }}>{h.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}