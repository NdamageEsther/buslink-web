import { useState, useEffect } from "react";
import api from "../../services/api";

interface Booking {
  id: string; passengerName?: string; passengerEmail?: string;
  passenger?: { name: string; email: string };
  schedule?: { departureTime: string; route?: { fromStation?: any; toStation?: any } };
  seatNumber?: string; status?: string; totalPrice?: number; price?: number; createdAt?: string;
}

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.bookings)) return data.bookings;
  if (data && typeof data === "object") { const a = Object.values(data).find(v => Array.isArray(v)); if (a) return a as any[]; }
  return [];
}

function statusColor(status?: string) {
  switch (status?.toUpperCase()) {
    case "CONFIRMED": return "bg-green-100 text-green-700";
    case "PENDING": return "bg-orange-100 text-orange-700";
    case "CANCELLED": return "bg-red-100 text-red-600";
    case "COMPLETED": return "bg-[#0a1628] text-white";
    default: return "bg-gray-100 text-gray-600";
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    setLoading(true);
    try { const res = await api.get("/bookings"); setBookings(extractArray(res.data)); }
    catch { setBookings([]); }
    finally { setLoading(false); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/bookings/${id}`, { status });
      setSuccessMessage(`Booking ${status.toLowerCase()} successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      fetchBookings();
    } catch (err: any) { setError(err?.response?.data?.message || "Failed to update booking."); }
  }

  function formatDate(dt?: string) {
    if (!dt) return "-";
    try { return new Date(dt).toLocaleString("en-RW", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return dt; }
  }

  const filtered = filter === "ALL" ? bookings : bookings.filter(b => b.status?.toUpperCase() === filter);
  const counts = {
    ALL: bookings.length,
    CONFIRMED: bookings.filter(b => b.status?.toUpperCase() === "CONFIRMED").length,
    PENDING: bookings.filter(b => b.status?.toUpperCase() === "PENDING").length,
    CANCELLED: bookings.filter(b => b.status?.toUpperCase() === "CANCELLED").length,
  };

  return (
    <div>
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">{successMessage}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage passenger bookings</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", key: "ALL", icon: "🎫" },
          { label: "Confirmed", key: "CONFIRMED", icon: "✅" },
          { label: "Pending", key: "PENDING", icon: "⏳" },
          { label: "Cancelled", key: "CANCELLED", icon: "❌" },
        ].map(s => (
          <div key={s.key} onClick={() => setFilter(s.key)} className={`bg-white rounded-2xl p-4 shadow-sm border-2 cursor-pointer transition-all ${filter === s.key ? "border-blue-500" : "border-transparent border border-gray-100"}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-2xl font-extrabold text-[#0a1628]">{counts[s.key as keyof typeof counts]}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors uppercase tracking-wide ${filter === f ? "bg-blue-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-5xl mb-3">🎫</p>
            <p className="font-medium">No bookings found.</p>
            <p className="text-sm mt-1">{filter === "ALL" ? "Bookings will appear here once passengers start booking." : `No ${filter.toLowerCase()} bookings.`}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wide border-b">
                <th className="text-left pb-3">Passenger</th>
                <th className="text-left pb-3">Route</th>
                <th className="text-left pb-3">Departure</th>
                <th className="text-left pb-3">Seat</th>
                <th className="text-left pb-3">Price</th>
                <th className="text-left pb-3">Booked</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-left pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const passengerName = b.passenger?.name || b.passengerName || "-";
                const passengerEmail = b.passenger?.email || b.passengerEmail || "";
                const from = b.schedule?.route?.fromStation?.name || "-";
                const to = b.schedule?.route?.toStation?.name || "-";
                const price = b.totalPrice || b.price;
                return (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-3">
                      <p className="font-bold text-gray-700">{passengerName}</p>
                      {passengerEmail && <p className="text-xs text-gray-400">{passengerEmail}</p>}
                    </td>
                    <td className="py-3 text-gray-600 text-xs">{from} → {to}</td>
                    <td className="py-3 text-gray-500 text-xs">{formatDate(b.schedule?.departureTime)}</td>
                    <td className="py-3 text-gray-500">{b.seatNumber || "-"}</td>
                    <td className="py-3 text-orange-600 font-bold text-xs">{price ? `RWF ${Number(price).toLocaleString()}` : "-"}</td>
                    <td className="py-3 text-gray-400 text-xs">{formatDate(b.createdAt)}</td>
                    <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColor(b.status)}`}>{b.status || "PENDING"}</span></td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {b.status?.toUpperCase() !== "CONFIRMED" && (
                          <button onClick={() => updateStatus(b.id, "CONFIRMED")} className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-bold">Confirm</button>
                        )}
                        {b.status?.toUpperCase() !== "CANCELLED" && (
                          <button onClick={() => updateStatus(b.id, "CANCELLED")} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
