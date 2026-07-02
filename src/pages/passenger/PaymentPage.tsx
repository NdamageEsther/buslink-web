import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";

interface BookingData {
  id: string;
  status: string;
  schedule?: {
    price: number;
    agency: { name: string };
    bus: { plateNumber: string };
    route: { fromStation: { name: string }; toStation: { name: string } };
    departureTime: string;
  };
}

type PayMethod = "MTN" | "AIRTEL" | "CARD";

export default function PaymentPage() {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const bookingId  = params.get("bookingId");

  const [booking,  setBooking]  = useState<BookingData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [paying,   setPaying]   = useState(false);
  const [error,    setError]    = useState("");
  const [method,   setMethod]   = useState<PayMethod>("MTN");
  const [phone,    setPhone]    = useState("");
  const [cardNum,  setCardNum]  = useState("");
  const [cardExp,  setCardExp]  = useState("");
  const [cardCvv,  setCardCvv]  = useState("");

  useEffect(() => {
    // Try sessionStorage first
    const cached = sessionStorage.getItem("buslink_booking");
    if (cached) {
      try {
        const b = JSON.parse(cached);
        if (b.id === bookingId) { setBooking(b); setLoading(false); return; }
      } catch {}
    }
    if (bookingId) {
      api.get(`/bookings/${bookingId}`).then(res => {
        setBooking(res.data?.booking || res.data);
      }).catch(() => setError("Failed to load booking")).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!booking) return;
    setPaying(true); setError("");

    const amount = booking.schedule?.price || 0;

    try {
      let res;
      if (method === "CARD") {
        if (!cardNum || !cardExp || !cardCvv) { setError("Please fill in all card details"); setPaying(false); return; }
        res = await api.post("/payments/card", {
          bookingId: booking.id,
          amount,
          cardNumber: cardNum.replace(/\s/g, ""),
        });
      } else {
        if (!phone) { setError("Please enter your phone number"); setPaying(false); return; }
        res = await api.post("/payments/mobile-money", {
          bookingId: booking.id,
          phone: phone.trim(),
          amount,
          provider: method === "MTN" ? "MTN" : "AIRTEL",
        });
      }

      const data = res.data;
      // Store payment result
      sessionStorage.setItem("buslink_payment", JSON.stringify(data));

      // Get ticket
      const ticketRes = await api.get(`/tickets/${booking.id}`).catch(() => ({ data: null }));
      const ticket = ticketRes.data?.ticket || ticketRes.data;
      if (ticket) sessionStorage.setItem("buslink_ticket", JSON.stringify(ticket));

      navigate(`/ticket/${booking.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Payment failed. Please try again.");
    } finally { setPaying(false); }
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", textAlign: "center", padding: "80px", color: "#94a3b8" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>💳</div>
        Loading payment...
      </div>
    );
  }

  const amount = booking?.schedule?.price || 0;
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: "10px", fontSize: "14px", color: "#1e293b", outline: "none",
    boxSizing: "border-box", backgroundColor: "#f8fafc",
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", maxWidth: "700px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <button onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#64748b", fontSize: "13px", cursor: "pointer", padding: 0, marginBottom: "12px", fontWeight: "500" }}>
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Payment</h1>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
          ⚠️ {error}
          <button onClick={() => setError("")} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>

        {/* Payment form */}
        <form onSubmit={handlePay}>
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: "0 0 18px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Select Payment Method</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
              {([
                { key: "MTN",    label: "MTN Mobile Money",   icon: "📱", color: "#f59e0b" },
                { key: "AIRTEL", label: "Airtel Money",       icon: "📲", color: "#ef4444" },
                { key: "CARD",   label: "Credit/Debit Card",  icon: "💳", color: "#1d4ed8" },
              ] as { key: PayMethod; label: string; icon: string; color: string }[]).map(m => (
                <button key={m.key} type="button" onClick={() => setMethod(m.key)}
                  style={{ padding: "14px 12px", border: `2px solid ${method === m.key ? m.color : "#e2e8f0"}`, borderRadius: "12px", backgroundColor: method === m.key ? `${m.color}10` : "#f8fafc", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
                  <div style={{ fontSize: "24px", marginBottom: "4px" }}>{m.icon}</div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: method === m.key ? m.color : "#64748b" }}>{m.label}</div>
                </button>
              ))}
            </div>

            {/* Mobile Money form */}
            {(method === "MTN" || method === "AIRTEL") && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {method === "MTN" ? "MTN" : "Airtel"} Phone Number
                </label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder={method === "MTN" ? "e.g. 078XXXXXXX" : "e.g. 073XXXXXXX"}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                <p style={{ fontSize: "12px", color: "#64748b", margin: "6px 0 0" }}>
                  {method === "MTN" ? "You will receive a payment prompt on your MTN line" : "You will receive a payment prompt on your Airtel line"}
                </p>
              </div>
            )}

            {/* Card form */}
            {method === "CARD" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Card Number</label>
                  <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                    placeholder="1234 5678 9012 3456" maxLength={19} style={{ ...inputStyle, fontFamily: "monospace", letterSpacing: "0.1em" }}
                    onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Expiry Date</label>
                    <input value={cardExp} onChange={e => setCardExp(e.target.value)} placeholder="MM/YY" maxLength={5} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>CVV</label>
                    <input value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="123" maxLength={4} type="password" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#1d4ed8")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={paying}
            style={{ width: "100%", padding: "15px", backgroundColor: paying ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: paying ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            onMouseEnter={e => { if (!paying) e.currentTarget.style.backgroundColor = "#1e40af"; }}
            onMouseLeave={e => { if (!paying) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
          >
            🔒 {paying ? "Processing Payment..." : `Pay RWF ${amount.toLocaleString()}`}
          </button>
        </form>

        {/* Order summary */}
        <div style={{ position: "sticky", top: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px" }}>Booking Summary</h3>
            {booking?.schedule && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>
                  {booking.schedule.route.fromStation.name} → {booking.schedule.route.toStation.name}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>{booking.schedule.agency.name}</div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>🚌 {booking.schedule.bus.plateNumber}</div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  🕐 {new Date(booking.schedule.departureTime).toLocaleString("en-RW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            )}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Total</span>
                <span style={{ fontSize: "20px", fontWeight: "800", color: "#1d4ed8" }}>RWF {amount.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ marginTop: "14px", padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: "12px", color: "#16a34a", lineHeight: 1.6 }}>
                🔒 Secured by BusLink Payment System. Your payment is encrypted and safe.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}