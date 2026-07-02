import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

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

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const scheduleId = params.get("scheduleId");

  const [schedule,  setSchedule]  = useState<Schedule | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [booking,   setBooking]   = useState(false);
  const [error,     setError]     = useState("");

  // In CheckoutPage.tsx, replace the useEffect with this:
useEffect(() => {
  if (!scheduleId) { setLoading(false); setError("No schedule selected"); return; }

  // Try sessionStorage first
  const cached = sessionStorage.getItem("buslink_schedule");
  if (cached) {
    try {
      const s = JSON.parse(cached);
      if (s.id === scheduleId) {
        setSchedule(s);
        setLoading(false);
        return;
      }
    } catch {}
  }

  // Fetch from API
  api.get(`/schedules/${scheduleId}`)
    .then(res => {
      const data = res.data;
      // Backend returns { schedule: {...} } or just the object
      setSchedule(data?.schedule || data);
    })
    .catch(() => setError("Schedule not found"))
    .finally(() => setLoading(false));
}, [scheduleId]);

  async function handleBook() {
    if (!schedule) return;
    setBooking(true); setError("");
    try {
      const res = await api.post("/bookings", { scheduleId: schedule.id });
      const bookingData = res.data?.booking || res.data;
      // Store booking for payment page
      sessionStorage.setItem("buslink_booking", JSON.stringify({ ...bookingData, schedule }));
      navigate(`/payment?bookingId=${bookingData.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create booking. Please try again.");
    } finally { setBooking(false); }
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", textAlign: "center", padding: "80px", color: "#94a3b8" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚌</div>
        Loading schedule...
      </div>
    );
  }

  if (!schedule) {
    return (
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", textAlign: "center", padding: "80px" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>❌</div>
        <p style={{ color: "#dc2626", fontWeight: "600" }}>Schedule not found</p>
        <button onClick={() => navigate("/home")} style={{ marginTop: "12px", padding: "10px 20px", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
          ← Back to Search
        </button>
      </div>
    );
  }

  const dep  = new Date(schedule.departureTime);
  const arr  = schedule.arrivalTime ? new Date(schedule.arrivalTime) : null;
  const depT = dep.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" });
  const arrT = arr ? arr.toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" }) : "—";
  const depD = dep.toLocaleDateString("en-RW", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", maxWidth: "800px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <button onClick={() => navigate("/home")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#64748b", fontSize: "13px", cursor: "pointer", padding: 0, marginBottom: "12px", fontWeight: "500" }}>
          ← Back to Search
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "4px", height: "28px", backgroundColor: "#1d4ed8", borderRadius: "2px" }} />
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Confirm Booking</h1>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }}>

        {/* Trip details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Route card */}
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", padding: "20px 24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Your Trip</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>
                {schedule.route.fromStation.name} → {schedule.route.toStation.name}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>{schedule.agency.name}</div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {[
                  { label: "Date",      value: depD },
                  { label: "Departure", value: depT },
                  { label: "Arrival",   value: arrT },
                  { label: "Bus",       value: schedule.bus.plateNumber },
                  { label: "Bus Type",  value: schedule.bus.busType || "Standard" },
                  { label: "Seats Left",value: schedule.availableSeats.toString() },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>{f.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Passenger info */}
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px 24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Passenger Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Full Name", value: user?.name || "—" },
                { label: "Email",     value: user?.email || "—" },
                { label: "Phone",     value: (user as any)?.phone || "—" },
                { label: "Role",      value: "Passenger" },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>{f.label}</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{f.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "14px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "12px", color: "#64748b" }}>
              ℹ️ Your passenger information is taken from your account. Update your profile to change these details.
            </div>
          </div>
        </div>

        {/* Order summary + confirm */}
        <div style={{ position: "sticky", top: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: "0 0 18px" }}>Order Summary</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>Route</span>
                <span style={{ fontWeight: "600", color: "#1e293b", textAlign: "right", maxWidth: "150px" }}>
                  {schedule.route.fromStation.name} → {schedule.route.toStation.name}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>Agency</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>{schedule.agency.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>Date</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>{dep.toLocaleDateString("en-RW", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>Departure</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>{depT}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#64748b" }}>Bus</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>{schedule.bus.plateNumber}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px", marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Total</span>
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#1d4ed8" }}>RWF {schedule.price.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handleBook} disabled={booking}
              style={{ width: "100%", padding: "14px", backgroundColor: booking ? "#93c5fd" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: booking ? "not-allowed" : "pointer" }}
              onMouseEnter={e => { if (!booking) e.currentTarget.style.backgroundColor = "#1e40af"; }}
              onMouseLeave={e => { if (!booking) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
            >
              {booking ? "Creating Booking..." : "Confirm & Proceed to Payment →"}
            </button>

            <div style={{ marginTop: "14px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
                🔒 Your booking is secured. After confirming, you'll be taken to the payment page to complete your purchase.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}