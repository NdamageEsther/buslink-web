import { useState, useEffect } from "react";
import api from "../../services/api";

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.bookings)) return data.bookings;
  if (data && Array.isArray(data.schedules)) return data.schedules;
  if (data && typeof data === "object") { const v = Object.values(data).find(x => Array.isArray(x)); if (v) return v as any[]; }
  return [];
}

interface Booking {
  id: string; status?: string; totalPrice?: number; price?: number; createdAt?: string;
  schedule?: { departureTime?: string; route?: { fromStation?: { name: string }; toStation?: { name: string } }; };
}
interface Schedule { id: string; status?: string; }

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 border-t border-r border-b border-gray-100 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-3xl font-extrabold text-[#0a1628]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "7" | "30">("30");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try { const r = await api.get("/bookings"); setBookings(extractArray(r.data)); } catch { setBookings([]); }
      try { const r = await api.get("/schedules"); setSchedules(extractArray(r.data)); } catch { setSchedules([]); }
      setLoading(false);
    }
    fetchData();
  }, []);

  const now = new Date();
  const filtered = bookings.filter(b => {
    if (period === "all") return true;
    const days = parseInt(period);
    const created = b.createdAt ? new Date(b.createdAt) : null;
    if (!created) return true;
    return (now.getTime() - created.getTime()) <= days * 24 * 60 * 60 * 1000;
  });

  const totalBookings = filtered.length;
  const confirmed = filtered.filter(b => b.status?.toUpperCase() === "CONFIRMED").length;
  const pending = filtered.filter(b => b.status?.toUpperCase() === "PENDING").length;
  const cancelled = filtered.filter(b => b.status?.toUpperCase() === "CANCELLED").length;
  const totalRevenue = filtered.reduce((sum, b) => sum + Number(b.totalPrice || b.price || 0), 0);
  const avgRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const activeSchedules = schedules.filter(s => s.status !== "CANCELLED").length;

  const statusData = [
    { label: "Confirmed", count: confirmed, color: "bg-green-500", pct: totalBookings > 0 ? (confirmed / totalBookings) * 100 : 0 },
    { label: "Pending", count: pending, color: "bg-orange-400", pct: totalBookings > 0 ? (pending / totalBookings) * 100 : 0 },
    { label: "Cancelled", count: cancelled, color: "bg-red-400", pct: totalBookings > 0 ? (cancelled / totalBookings) * 100 : 0 },
  ];

  const routeCounts: Record<string, { count: number; revenue: number }> = {};
  filtered.forEach(b => {
    const from = b.schedule?.route?.fromStation?.name || "Unknown";
    const to = b.schedule?.route?.toStation?.name || "Unknown";
    const key = `${from} → ${to}`;
    if (!routeCounts[key]) routeCounts[key] = { count: 0, revenue: 0 };
    routeCounts[key].count++;
    routeCounts[key].revenue += Number(b.totalPrice || b.price || 0);
  });
  const topRoutes = Object.entries(routeCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  const last7: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-RW", { weekday: "short", day: "numeric" });
    const dateStr = d.toISOString().split("T")[0];
    const count = bookings.filter(b => b.createdAt?.startsWith(dateStr)).length;
    last7.push({ date: label, count });
  }
  const maxDay = Math.max(...last7.map(d => d.count), 1);

  function formatRWF(n: number) { return `RWF ${Math.round(n).toLocaleString()}`; }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your agency performance</p>
        </div>
        <div className="flex gap-2">
          {([["7", "Last 7 days"], ["30", "Last 30 days"], ["all", "All time"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)} className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors uppercase tracking-wide ${period === val ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading reports...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="🎫" label="Total Bookings" value={totalBookings} sub="in selected period" />
            <StatCard icon="💰" label="Total Revenue" value={formatRWF(totalRevenue)} sub={`Avg ${formatRWF(avgRevenue)} / booking`} />
            <StatCard icon="✅" label="Confirmed" value={confirmed} sub={`${totalBookings > 0 ? Math.round((confirmed / totalBookings) * 100) : 0}% of bookings`} />
            <StatCard icon="🚌" label="Active Schedules" value={activeSchedules} sub={`${schedules.length} total`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">Booking Status Breakdown</h2>
              {totalBookings === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No booking data yet</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {statusData.map(s => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-700">{s.label}</span>
                        <span className="text-sm font-bold text-gray-800">{s.count} <span className="text-gray-400 font-normal">({Math.round(s.pct)}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className={`${s.color} h-3 rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">Bookings — Last 7 Days</h2>
              <div className="flex items-end gap-2 h-32">
                {last7.map(d => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-600">{d.count > 0 ? d.count : ""}</span>
                    <div className="w-full rounded-t-lg transition-all" style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? "8px" : "2px", backgroundColor: d.count === 0 ? "#e5e7eb" : "#1643e4" }} />
                    <span className="text-xs text-gray-400 text-center leading-tight">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">Top Routes by Bookings</h2>
            {topRoutes.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No route data yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wide border-b">
                    <th className="text-left pb-3">#</th>
                    <th className="text-left pb-3">Route</th>
                    <th className="text-left pb-3">Bookings</th>
                    <th className="text-left pb-3">Revenue</th>
                    <th className="text-left pb-3">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {topRoutes.map(([route, data], i) => (
                    <tr key={route} className="border-b last:border-0">
                      <td className="py-3 text-gray-400 font-bold">{i + 1}</td>
                      <td className="py-3 font-bold text-gray-800">{route}</td>
                      <td className="py-3 text-gray-600">{data.count}</td>
                      <td className="py-3 font-bold text-blue-600">{formatRWF(data.revenue)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(data.count / totalBookings) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{Math.round((data.count / totalBookings) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-extrabold text-[#0a1628] uppercase mb-4">Recent Bookings</h2>
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No bookings in this period</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wide border-b">
                    <th className="text-left pb-3">ID</th>
                    <th className="text-left pb-3">Route</th>
                    <th className="text-left pb-3">Date</th>
                    <th className="text-left pb-3">Amount</th>
                    <th className="text-left pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 10).map(b => {
                    const from = b.schedule?.route?.fromStation?.name || "-";
                    const to = b.schedule?.route?.toStation?.name || "-";
                    const amount = Number(b.totalPrice || b.price || 0);
                    const st = (b.status || "PENDING").toUpperCase();
                    const stColor = st === "CONFIRMED" ? "bg-green-100 text-green-700" : st === "CANCELLED" ? "bg-red-100 text-red-600" : st === "COMPLETED" ? "bg-[#0a1628] text-white" : "bg-blue-100 text-blue-700";
                    return (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="py-3 text-gray-400 font-mono text-xs">{b.id.slice(0, 8)}...</td>
                        <td className="py-3 font-bold text-gray-700">{from} → {to}</td>
                        <td className="py-3 text-gray-500">{b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-RW", { dateStyle: "medium" }) : "-"}</td>
                        <td className="py-3 font-bold text-blue-600">{amount > 0 ? formatRWF(amount) : "-"}</td>
                        <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full font-bold ${stColor}`}>{st}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
