export default function FraudAlertsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0a1628] uppercase">Fraud Alerts</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor suspicious activity on the platform</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Alerts", value: "0", icon: "🚨" },
          { label: "Resolved Today", value: "0", icon: "✅" },
          { label: "Under Review", value: "0", icon: "🔍" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-[#0a1628] w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0">{s.icon}</div>
            <div>
              <p className="text-2xl font-extrabold text-[#0a1628]">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
        <p className="text-5xl mb-3">🚨</p>
        <p className="font-medium">No fraud alerts at this time</p>
        <p className="text-sm mt-1">Suspicious bookings, duplicate tickets, and payment anomalies will appear here</p>
      </div>
    </div>
  );
}
