import { useState } from "react";

const NEWS = [
  { id: 1, type: "ALERT", icon: "⚠️", title: "Route Kigali → Butare Delayed", body: "Due to road works on RN1, all buses on this route are delayed by approximately 45 minutes. Please plan accordingly.", time: "2 hours ago", agency: "YAHOO Transport Ltd", border: "border-yellow-400", bg: "bg-yellow-50" },
  { id: 2, type: "INFO", icon: "🚌", title: "New Express Service: Kigali → Musanze", body: "Volcano Express has launched a new non-stop express service departing daily at 06:00 and 14:00 from Nyabugogo Terminal.", time: "5 hours ago", agency: "Volcano Express", border: "border-blue-400", bg: "bg-blue-50" },
  { id: 3, type: "UPDATE", icon: "✅", title: "Kigali → Gisenyi Route Resumed", body: "The Kigali to Gisenyi route is fully operational again after yesterday maintenance. Normal schedule resumes today.", time: "1 day ago", agency: "Kigali Coach", border: "border-green-400", bg: "bg-green-50" },
  { id: 4, type: "ALERT", icon: "🌧️", title: "Weather Warning: Northern Routes", body: "Heavy rain is expected in Musanze and Gisenyi areas. Buses on northern routes may experience minor delays. Stay safe.", time: "1 day ago", agency: "BusLink Admin", border: "border-red-400", bg: "bg-blue-50" },
  { id: 5, type: "INFO", icon: "💰", title: "Discounted Fares This Weekend", body: "Horizon Express is offering 20% off all tickets booked this Saturday and Sunday. Use code WEEKEND20 at checkout.", time: "2 days ago", agency: "Horizon Express", border: "border-blue-400", bg: "bg-blue-50" },
  { id: 6, type: "UPDATE", icon: "🏗️", title: "New Nyamagabe Terminal Opening", body: "A new bus terminal in Nyamagabe is opening next Monday. Passengers on this route will board from the new facility.", time: "3 days ago", agency: "BusLink Admin", border: "border-gray-400", bg: "bg-gray-50" },
  { id: 7, type: "ALERT", icon: "🚧", title: "Road Closure: Butare → Huye", body: "Section of RN1 near Huye is closed for emergency repairs. Buses will use the alternative Ngoma road — expect 30 min extra.", time: "3 days ago", agency: "BusLink Admin", border: "border-red-400", bg: "bg-blue-50" },
  { id: 8, type: "INFO", icon: "📱", title: "BusLink App Update Available", body: "A new version of BusLink is available with faster search, improved ticket display, and AI chat support. Update now!", time: "4 days ago", agency: "BusLink Admin", border: "border-blue-400", bg: "bg-blue-50" },
];

const TYPES = ["ALL", "ALERT", "INFO", "UPDATE"] as const;
type FilterType = typeof TYPES[number];
const typeLabel: Record<FilterType, string> = { ALL: "📰 All", ALERT: "⚠️ Alerts", INFO: "🚌 News", UPDATE: "✅ Updates" };

export default function NewsPage() {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const filtered = filter === "ALL" ? NEWS : NEWS.filter(n => n.type === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Bus News & Alerts</h1>
        <p className="text-gray-400 text-sm mt-1">Stay updated on schedules, delays, and route changes</p>
      </div>
      <div className="flex items-center gap-2 mb-5 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block" />
        <span className="text-sm text-blue-700 font-bold">Live updates — refreshed every hour</span>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors uppercase tracking-wide ${filter === t ? "bg-blue-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
            {typeLabel[t]}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {filtered.map(item => (
          <div key={item.id} className={`rounded-2xl border-l-4 p-5 shadow-sm ${item.border} ${item.bg}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                  <h3 className="font-extrabold text-[#0a1628] text-base">{item.title}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                <div className="mt-3">
                  <span className="text-xs bg-white/80 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-medium">
                    🏢 {item.agency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-extrabold text-gray-500">No {filter.toLowerCase()} right now</p>
        </div>
      )}
    </div>
  );
}
