import Navbar from '../../components/shared/Navbar';

const ROUTES = [
  { from: "Nyabugogo", to: "Muhanga",    distance: "47 km",  price: 2000 },
  { from: "Nyabugogo", to: "Ruhango",    distance: "86 km",  price: 2500 },
  { from: "Nyabugogo", to: "Huye",       distance: "135 km", price: 5000 },
  { from: "Nyabugogo", to: "Nyamagabe",  distance: "150 km", price: 7500 },
  { from: "Nyabugogo", to: "Musanze",    distance: "110 km", price: 3800 },
  { from: "Nyabugogo", to: "Rubavu",     distance: "160 km", price: 6000 },
  { from: "Nyabugogo", to: "Karongi",    distance: "120 km", price: 4000 },
  { from: "Nyabugogo", to: "Rusizi",     distance: "225 km", price: 11200 },
  { from: "Nyabugogo", to: "Nyamasheke", distance: "190 km", price: 1000 },
  { from: "Nyabugogo", to: "Nyagatare",  distance: "130 km", price: 5000 },
  { from: "Nyabugogo", to: "Rwamagana",  distance: "45 km",  price: 2500 },
  { from: "Nyabugogo", to: "Kayonza",    distance: "80 km",  price: 3000 },
  { from: "Nyabugogo", to: "Ngoma",      distance: "115 km", price: 4600 },
  { from: "Nyabugogo", to: "Kirehe",     distance: "160 km", price: 5600 },
  { from: "Nyabugogo", to: "Gicumbi",    distance: "75 km",  price: 3000 },
  { from: "Rubavu",    to: "Musanze",    distance: "70 km",  price: 2700 },
];

export default function PricesPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)", padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", padding: "4px 14px", marginBottom: "20px" }}>
            <div style={{ width: "6px", height: "6px", backgroundColor: "#4ade80", borderRadius: "50%" }} />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px", fontWeight: "500" }}>RURA Regulated Prices</span>
          </div>
          <h1 style={{ fontSize: "42px", fontWeight: "800", color: "#fff", margin: "0 0 12px" }}>Bus Ticket Prices</h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", margin: 0, lineHeight: 1.7 }}>
            All prices are fixed and regulated by the Rwanda Utilities Regulatory Authority (RURA).<br />
            Prices are per seat, in Rwandan Francs (RWF).
          </p>
        </div>
      </section>

      {/* RURA notice */}
      <div style={{ maxWidth: "900px", margin: "-30px auto 0", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", backgroundColor: "#dbeafe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "18px" }}>
            ℹ️
          </div>
          <p style={{ fontSize: "13px", color: "#1e40af", margin: 0, lineHeight: 1.6 }}>
            <strong>RURA Fixed Prices:</strong> All intercity bus fares in Rwanda are set and regulated by RURA. 
            These prices apply to all transport agencies and cannot be altered. 
            Prices shown are per seat in RWF.
          </p>
        </div>
      </div>

      {/* Price Table */}
      <div style={{ maxWidth: "900px", margin: "32px auto 60px", padding: "0 24px" }}>
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

          {/* Table header */}
          <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px" }}>Route Price List</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{ROUTES.length} routes — RURA regulated fares</p>
            </div>
            <div style={{ backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "6px 14px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>✓ RURA Certified</span>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ padding: "14px 28px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", width: "40%" }}>FROM</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", width: "35%" }}>TO</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", width: "10%" }}>DISTANCE</th>
                <th style={{ padding: "14px 28px", textAlign: "right", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", width: "15%" }}>PRICE (RWF)</th>
              </tr>
            </thead>
            <tbody>
              {ROUTES.map((route, i) => (
                <tr key={i}
                  style={{ borderTop: "1px solid #f1f5f9" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* FROM */}
                  <td style={{ padding: "16px 28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", backgroundColor: "#dbeafe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <span style={{ fontWeight: "700", color: "#1e293b" }}>{route.from}</span>
                    </div>
                  </td>

                  {/* TO */}
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#1d4ed8", fontWeight: "700", fontSize: "16px" }}>→</span>
                      <span style={{ fontWeight: "600", color: "#374151" }}>{route.to}</span>
                    </div>
                  </td>

                  {/* DISTANCE */}
                  <td style={{ padding: "16px", color: "#94a3b8", fontSize: "13px" }}>
                    {route.distance}
                  </td>

                  {/* PRICE */}
                  <td style={{ padding: "16px 28px", textAlign: "right" }}>
                    <span style={{ display: "inline-block", backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: "800", fontSize: "15px", padding: "6px 14px", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                      {route.price.toLocaleString()} RWF
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer note */}
          <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              💡 Prices are regulated by <strong>RURA</strong> and apply equally to all licensed transport operators in Rwanda.
              Prices are subject to RURA review and may change with official notice.
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: "#0f172a", padding: "40px 24px", textAlign: "center" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>© 2026 BusLink — Rwanda Smart Bus Ticketing Platform</p>
      </footer>
    </div>
  );
}