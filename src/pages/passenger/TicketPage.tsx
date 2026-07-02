import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

interface Ticket {
  id: string;
  qrCode: string;
  isValidated: boolean;
  validatedAt?: string;
  booking: {
    id: string;
    status: string;
    passenger?: { name?: string; phone?: string };
    schedule?: {
      departureTime: string;
      arrivalTime?: string;
      price: number;
      bus?: { plateNumber?: string; busType?: string };
      route?: {
        fromStation?: { name: string; city?: string };
        toStation?:   { name: string; city?: string };
        agency?: { name: string };
      };
    };
  };
}

function QRCodeImage({ value }: { value: string }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const encoded = encodeURIComponent(value);
  const primary  = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encoded}&color=1d4ed8&bgcolor=ffffff&margin=12&qzone=2`;
  const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encoded}`;

  return (
    <div style={{
      width: "200px",
      height: "200px",
      backgroundColor: "#fff",
      borderRadius: "16px",
      border: "2px solid #e2e8f0",
      padding: "10px",
      boxShadow: "0 4px 24px rgba(29,78,216,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}>
      {!loaded && !errored && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "14px", backgroundColor: "#f8fafc" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>Loading QR...</div>
        </div>
      )}
      {!errored ? (
        <img
          src={primary}
          alt="Ticket QR Code"
          style={{ width: "100%", height: "100%", borderRadius: "8px", display: loaded ? "block" : "none" }}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrored(true);
            setLoaded(false);
          }}
        />
      ) : (
        <img
          src={fallback}
          alt="Ticket QR Code"
          style={{ width: "100%", height: "100%", borderRadius: "8px" }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

export default function TicketPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);

  const [ticket,  setTicket]  = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const cached = sessionStorage.getItem("buslink_ticket");
    if (cached) {
      try {
        const t = JSON.parse(cached);
        if (t.booking?.id === id || t.bookingId === id) {
          setTicket(t);
          setLoading(false);
          return;
        }
      } catch {}
    }
    if (id) {
      api.get(`/tickets/${id}`)
        .then(res => setTicket(res.data?.ticket || res.data))
        .catch(err => setError(err?.response?.data?.message || "Ticket not found"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px", color: "#94a3b8" }}>
        <div style={{ fontSize: "40px" }}>🎫</div>
        <p style={{ fontSize: "15px", fontWeight: "500", margin: 0 }}>Loading your ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div style={{ fontSize: "40px" }}>❌</div>
        <p style={{ color: "#dc2626", fontWeight: "600", margin: 0 }}>{error || "Ticket not found"}</p>
        <button
          onClick={() => navigate("/bookings")}
          style={{ padding: "10px 24px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
        >
          View My Bookings
        </button>
      </div>
    );
  }

  const schedule  = ticket.booking.schedule;
  const passenger = ticket.booking.passenger;
  const dep = schedule?.departureTime ? new Date(schedule.departureTime) : null;
  const arr = schedule?.arrivalTime   ? new Date(schedule.arrivalTime)   : null;
  const depT = dep ? dep.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) : "—";
  const arrT = arr ? arr.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) : "—";
  const depD = dep ? dep.toLocaleDateString("en-RW", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "—";
  const agency = schedule?.route?.agency?.name || "BusLink";
  const from   = schedule?.route?.fromStation?.name || "—";
  const to     = schedule?.route?.toStation?.name   || "—";
  const bus    = schedule?.bus?.plateNumber || "—";
  const price  = schedule?.price || 0;

  // QR data — use backend qrCode if available, otherwise build one
  const qrValue = ticket.qrCode || JSON.stringify({
    ticketId:  ticket.id,
    bookingId: ticket.booking.id,
    passenger: passenger?.name,
    from, to,
    departure: depT,
    date:      depD,
    status:    ticket.booking.status,
  });

  const shortCode = ticket.id?.slice(0, 8).toUpperCase();

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <button
            onClick={() => navigate("/bookings")}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#64748b", fontSize: "13px", cursor: "pointer", padding: 0, marginBottom: "8px", fontWeight: "500" }}
          >
            ← My Bookings
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Your E-Ticket</h1>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handlePrint}
            style={{ padding: "10px 18px", border: "1.5px solid #1d4ed8", borderRadius: "10px", color: "#1d4ed8", backgroundColor: "#fff", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Save PDF
          </button>
          <button
            onClick={() => navigate("/home")}
            style={{ padding: "10px 18px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
          >
            Book Another →
          </button>
        </div>
      </div>

      {/* Success banner */}
      <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "14px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ fontSize: "26px" }}>✅</div>
        <div>
          <div style={{ fontWeight: "700", fontSize: "14px", color: "#16a34a" }}>Booking Confirmed — Payment Successful</div>
          <div style={{ fontSize: "12px", color: "#15803d", marginTop: "2px" }}>Show the QR code below to the driver or station staff to board your bus.</div>
        </div>
      </div>

      {/* ── TICKET CARD ── */}
      <div ref={ticketRef} style={{ maxWidth: "580px", margin: "0 auto" }}>
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", border: "2px solid #e2e8f0", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>

          {/* Ticket top header */}
          <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", padding: "22px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "38px", height: "38px", backgroundColor: "#2563eb", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: "800", color: "#fff" }}>BusLink</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>E-Ticket • Rwanda</div>
                </div>
              </div>
              <span style={{
                fontSize: "12px", fontWeight: "700", padding: "5px 14px", borderRadius: "20px",
                backgroundColor: ticket.isValidated ? "#dcfce7" : "#dbeafe",
                color: ticket.isValidated ? "#16a34a" : "#2563eb",
              }}>
                {ticket.isValidated ? "✅ Used" : "🎫 Valid"}
              </span>
            </div>
          </div>

          {/* Route section */}
          <div style={{ padding: "22px 28px", borderBottom: "2px dashed #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>FROM</div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", lineHeight: 1 }}>{from}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>{schedule?.route?.fromStation?.city || ""}</div>
              </div>
              <div style={{ textAlign: "center", flex: 1, padding: "0 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                  <div style={{ flex: 1, height: "1.5px", backgroundColor: "#e2e8f0" }} />
                  <div style={{ fontSize: "18px" }}>✈</div>
                  <div style={{ flex: 1, height: "1.5px", backgroundColor: "#e2e8f0" }} />
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "4px" }}>{schedule?.bus?.busType || "Standard"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>TO</div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", lineHeight: 1 }}>{to}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>{schedule?.route?.toStation?.city || ""}</div>
              </div>
            </div>

            {/* Trip details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", backgroundColor: "#f8fafc", borderRadius: "12px", padding: "14px 16px" }}>
              {[
                { label: "Date",      value: depD },
                { label: "Departure", value: depT },
                { label: "Arrival",   value: arrT },
                { label: "Bus",       value: bus },
                { label: "Agency",    value: agency },
                { label: "Price",     value: `RWF ${price.toLocaleString()}` },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>{f.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Passenger + QR */}
          <div style={{ padding: "22px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "start" }}>

              {/* Passenger info */}
              <div>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>PASSENGER</div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "2px" }}>{passenger?.name || "—"}</div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>{passenger?.phone || ""}</div>

                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>BOOKING ID</div>
                    <div style={{ fontSize: "12px", fontFamily: "monospace", color: "#1d4ed8", fontWeight: "600", backgroundColor: "#eff6ff", padding: "4px 10px", borderRadius: "6px", display: "inline-block" }}>
                      {ticket.booking.id.slice(0, 18).toUpperCase()}...
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>BOOKING STATUS</div>
                    <span style={{
                      fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px",
                      backgroundColor: ticket.booking.status === "CONFIRMED" ? "#dcfce7" : ticket.booking.status === "USED" ? "#dbeafe" : "#fef9c3",
                      color: ticket.booking.status === "CONFIRMED" ? "#16a34a" : ticket.booking.status === "USED" ? "#1d4ed8" : "#92400e",
                    }}>
                      {ticket.booking.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── QR CODE ── */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <QRCodeImage value={qrValue} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Ticket Code</div>
                  <div style={{ fontSize: "13px", fontFamily: "monospace", fontWeight: "800", color: "#000208", backgroundColor: "#eff6ff", padding: "5px 12px", borderRadius: "8px", letterSpacing: "0.06em" }}>
                    {shortCode}
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>Show to driver</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket footer */}
          <div style={{ backgroundColor: "#f8fafc", padding: "12px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>© 2026 BusLink — Rwanda Smart Bus Ticketing</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>{shortCode}</div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          nav, footer, button, aside, .no-print { display: none !important; }
          body { background: white; margin: 0; }
          main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}