import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4fa', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>
              Bus<span style={{ color: '#2563eb' }}>Link</span>
            </span>
          </Link>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[
              { label: 'Home', to: '/' },
              { label: 'Prices', to: '/prices' },
              { label: 'About', to: '/about' },
              { label: 'Contact Us', to: '/contact' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                style={{
                  padding: '7px 14px', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '15px', fontWeight: item.label === 'About' ? '700' : '500',
                  color: item.label === 'About' ? '#2563eb' : '#475569',
                  backgroundColor: item.label === 'About' ? '#eff6ff' : 'transparent',
                }}>
                {item.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 5.5 5.5l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1 }}>24/7 Support</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', lineHeight: 1.4 }}>+250-788-000-000</div>
              </div>
            </div>
            <Link to="/login" style={{ padding: '8px 16px', border: '1.5px solid #2563eb', borderRadius: '8px', color: '#2563eb', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ padding: '8px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — same gradient as LandingPage */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)',
        padding: '72px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 75% 50%, rgba(96,165,250,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>WHO WE ARE</p>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#fff', margin: '0 0 18px', lineHeight: 1.1 }}>About BusLink</h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.72)', maxWidth: '560px', lineHeight: 1.7, margin: 0 }}>
            Rwanda's intelligent bus ticketing and transport management platform — connecting passengers and transport companies in one smart system.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 56px' }}>

        {/* Mission + Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

          {/* Our Mission */}
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 14px' }}>Our Mission</h2>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.75, margin: '0 0 14px' }}>
              BusLink makes bus travel in Rwanda easier, faster, and more reliable. We connect passengers directly with bus operators through a single digital platform — eliminating queues, paper tickets, and uncertainty.
            </p>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.75, margin: 0 }}>
              Book tickets online, pay with Mobile Money or card, and board with a QR code. No more waiting at bus stations.
            </p>
          </div>

          {/* Stats 2x2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { icon: '🚌', value: '200+', label: 'Routes nationwide' },
              { icon: '🏢', value: '50+',  label: 'Bus operators' },
              { icon: '👥', value: '10K+', label: 'Happy passengers' },
              { icon: '🎧', value: '24/7', label: 'Customer support' },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '28px' }}>{stat.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '32px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>How It Works</p>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 24px' }}>Simple. Fast. Reliable.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { step: '01', icon: '🔍', title: 'Search Route',    desc: 'Enter origin, destination, and travel date.' },
              { step: '02', icon: '🪑', title: 'Select & Reserve', desc: 'Pick your bus, seat, and departure time.' },
              { step: '03', icon: '💳', title: 'Pay Digitally',   desc: 'Mobile Money or card — secure & instant.' },
              { step: '04', icon: '📱', title: 'Board with QR',   desc: 'Scan your QR code ticket and board.' },
            ].map((s, i) => (
              <div key={s.step} style={{ padding: '20px', backgroundColor: '#f0f4fa', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                {i < 3 && <div style={{ position: 'absolute', right: '-10px', top: '28px', color: '#cbd5e1', fontSize: '16px', zIndex: 1 }}>→</div>}
                <div style={{ width: '40px', height: '40px', backgroundColor: '#2563eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '18px' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#2563eb', marginBottom: '4px', letterSpacing: '0.06em' }}>STEP {s.step}</div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px' }}>{s.title}</h4>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Two info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>💳 Payment Methods</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.75, margin: 0 }}>
              We support MTN Mobile Money, Airtel Money, and card payments. Every transaction is encrypted and fraud-screened. Your QR e-ticket is delivered instantly after payment — no paper required.
            </p>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>🛡️ Safety & Security</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.75, margin: 0 }}>
              All bookings are verified and tracked in real time. Our fraud detection system monitors every transaction. Your personal data is stored securely and never shared with third parties.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', borderRadius: '16px', padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 6px' }}>Ready to travel smarter?</h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '14px', margin: 0 }}>Join thousands of passengers booking with BusLink every day.</p>
          </div>
         
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0f172a', padding: '28px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', backgroundColor: '#2563eb', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>BusLink</span>
          </div>
          <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>© 2026 BusLink — Intelligent Bus Ticketing & Transport Management System</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}