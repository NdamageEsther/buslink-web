import { useState, useEffect } from "react";
import api from "../../services/api";

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.agencies)) return data.agencies;
  if (data && Array.isArray(data.users)) return data.users;
  if (data && Array.isArray(data.bookings)) return data.bookings;
  if (data && typeof data === "object") {
    const arrProp = Object.values(data).find(v => Array.isArray(v));
    if (arrProp) return arrProp as any[];
  }
  return [];
}

export default function ReportsPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try { const r = await api.get("/agencies"); setAgencies(extractArray(r.data)); } catch {}
      try { const r = await api.get("/users"); setUsers(extractArray(r.data)); } catch {}
      try { const r = await api.get("/bookings"); setBookings(extractArray(r.data)); } catch {}
      setLoading(false);
    }
    fetchAll();
  }, []);

  const passengers = users.filter((u: any) => u.role === "PASSENGER");
  const admins = users.filter((u: any) => u.role === "AGENCY_ADMIN");
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + Number(b.totalPrice || b.price || 0), 0);
  const confirmed = bookings.filter((b: any) => b.status?.toUpperCase() === "CONFIRMED").length;
  const cancelled = bookings.filter((b: any) => b.status?.toUpperCase() === "CANCELLED").length;
  const pending = bookings.filter((b: any) => b.status?.toUpperCase() === "PENDING").length;

  const agencyBookings: Record<string, number> = {};
  bookings.forEach((b: any) => {
    const name = b.schedule?.route?.agency?.name || b.agencyName || "Unknown";
    agencyBookings[name] = (agencyBookings[name] || 0) + 1;
  });
  const topAgencies = Object.entries(agencyBookings).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const last7: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-RW", { weekday: "short", day: "numeric" });
    const count = users.filter((u: any) => u.createdAt?.startsWith(dateStr)).length;
    last7.push({ date: label, count });
  }
  const maxDay = Math.max(...last7.map(d => d.count), 1);

  const statCards = [
    { icon: "🏢", label: "Total Agencies", value: agencies.length },
    { icon: "👥", label: "Total Passengers", value: passengers.length },
    { icon: "🎫", label: "Total Bookings", value: bookings.length },
    { icon: "💰", label: "Total Revenue", value: `RWF ${Math.round(totalRevenue).toLocaleString()}` },
    { icon: "✅", label: "Confirmed", value: confirmed },
    { icon: "⏳", label: "Pending", value: pending },
    { icon: "❌", label: "Cancelled", value: cancelled },
    { icon: "🛡️", label: "Agency Admins", value: admins.length },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Platform Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Full overview of BusLink platform activity</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading reports...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(s => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 border-t border-r border-b border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <p className="text-2xl font-extrabold text-[#0a1628]">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">Booking Status Breakdown</h2>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No booking data yet</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Confirmed", count: confirmed, color: "bg-green-500" },
                    { label: "Pending", count: pending, color: "bg-blue-400" },
                    { label: "Cancelled", count: cancelled, color: "bg-red-400" },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-gray-700">{s.label}</span>
                        <span className="text-sm font-bold text-gray-800">
                          {s.count} <span className="text-gray-400 font-normal">({bookings.length > 0 ? Math.round((s.count / bookings.length) * 100) : 0}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className={`${s.color} h-3 rounded-full`} style={{ width: `${bookings.length > 0 ? (s.count / bookings.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">New Users — Last 7 Days</h2>
              <div className="flex items-end gap-2 h-32">
                {last7.map(d => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-600">{d.count > 0 ? d.count : ""}</span>
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${(d.count / maxDay) * 100}%`,
                        minHeight: d.count > 0 ? "8px" : "2px",
                        backgroundColor: d.count > 0 ? "#3b82f6" : "#e5e7eb"
                      }}
                    />
                    <span className="text-xs text-gray-400 text-center leading-tight">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">Top Agencies by Bookings</h2>
            {topAgencies.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No agency booking data yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wide border-b">
                    <th className="text-left pb-3">#</th>
                    <th className="text-left pb-3">Agency</th>
                    <th className="text-left pb-3">Bookings</th>
                    <th className="text-left pb-3">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {topAgencies.map(([name, count], i) => (
                    <tr key={name} className="border-b last:border-0">
                      <td className="py-3 text-gray-400 font-bold">{i + 1}</td>
                      <td className="py-3 font-bold text-gray-800">{name}</td>
                      <td className="py-3 text-gray-600">{count}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(count / bookings.length) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{Math.round((count / bookings.length) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">Recent Users</h2>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No users data yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wide border-b">
                    <th className="text-left pb-3">Name</th>
                    <th className="text-left pb-3">Email</th>
                    <th className="text-left pb-3">Role</th>
                    <th className="text-left pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 8).map((u: any) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-3 font-bold text-gray-800">{u.name || "-"}</td>
                      <td className="py-3 text-gray-500">{u.email || "-"}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          u.role === "SYSTEM_ADMIN" ? "bg-[#0a1628] text-white" :
                          u.role === "AGENCY_ADMIN" ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        }`}>{u.role || "PASSENGER"}</span>
                      </td>
                      <td className="py-3 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-RW", { dateStyle: "medium" }) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
