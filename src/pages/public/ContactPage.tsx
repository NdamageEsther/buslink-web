import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (!form.name || !form.email || !form.message) return;
    // TODO: wire to your API: api.post('/contact', form)
    setSent(true);
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      {/* HERO — matches landing page style */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        overflow: 'hidden',
        padding: '72px 24px 80px',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 14px', marginBottom: '20px' }}>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#4ade80', borderRadius: '50%' }} />
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '500' }}>We reply within 2 hours</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#fff', lineHeight: 1.1, margin: '0 0 8px' }}>Contact Us</h1>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#60a5fa', lineHeight: 1.1, margin: '0 0 20px' }}>We're Here 24/7</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '17px', lineHeight: 1.7, margin: 0, maxWidth: '500px' }}>
            Reach out anytime — for bookings, payments, or general enquiries, our team is always ready to help.
          </p>
        </div>

        {/* Decorative envelope */}
        <div style={{ position: 'absolute', right: '40px', bottom: '20px', opacity: 0.1, pointerEvents: 'none' }}>
          <svg width="320" height="200" viewBox="0 0 320 200" fill="none">
            <rect x="10" y="30" width="300" height="160" rx="16" fill="white"/>
            <path d="M10 46 L160 120 L310 46" stroke="#1d4ed8" strokeWidth="4" fill="none"/>
            <line x1="10" y1="190" x2="100" y2="120" stroke="#1d4ed8" strokeWidth="3"/>
            <line x1="310" y1="190" x2="220" y2="120" stroke="#1d4ed8" strokeWidth="3"/>
          </svg>
        </div>
      </section>

      {/* TRUST BADGES — same as homepage */}
      <section style={{ maxWidth: '1100px', margin: '32px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {[
            { icon: '📞', bg: '#dbeafe', title: '24/7 Phone',      sub: '+250-788-000-000' },
            { icon: '📧', bg: '#dcfce7', title: 'Email Support',   sub: 'support@buslink.rw' },
            { icon: '📍', bg: '#ede9fe', title: 'Head Office',     sub: 'Kigali, Rwanda' },
            { icon: '⏰', bg: '#fef3c7', title: 'Office Hours',    sub: 'Mon–Sun 7am–8pm' },
          ].map((badge, i) => (
            <div key={i} style={{ backgroundColor: '#fff', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: badge.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {badge.icon}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{badge.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section style={{ maxWidth: '1100px', margin: '28px auto 0', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>

        {/* Left — contact details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Contact cards */}
          {[
            { icon: '📞', bg: '#dbeafe', title: '24/7 Phone Support', value: '+250-788-000-000', sub: 'Available round the clock' },
            { icon: '📧', bg: '#dcfce7', title: 'Email Us',           value: 'support@buslink.rw',  sub: 'We reply within 2 hours' },
            { icon: '📍', bg: '#ede9fe', title: 'Head Office',        value: 'Kigali, Rwanda',       sub: 'KG 123 St, Nyarugenge' },
            { icon: '⏰', bg: '#fef3c7', title: 'Office Hours',       value: 'Mon–Fri 7am–8pm',      sub: 'Sat–Sun 8am–6pm' },
          ].map(item => (
            <div key={item.title} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ width: '44px', height: '44px', backgroundColor: item.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{item.value}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.sub}</div>
              </div>
            </div>
          ))}

          {/* Social */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Follow Us</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'Twitter / X', bg: '#dbeafe', color: '#1e40af' },
                { label: 'Facebook',    bg: '#dcfce7', color: '#166534' },
                { label: 'Instagram',   bg: '#ede9fe', color: '#5b21b6' },
              ].map(s => (
                <div key={s.label} style={{ padding: '7px 16px', backgroundColor: s.bg, borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: s.color, cursor: 'pointer' }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Dark CTA card */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>New to BusLink?</div>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
              Create a free account and start booking bus tickets across Rwanda in minutes.
            </p>
            <button
              onClick={() => navigate('/register')}
              style={{ width: '100%', padding: '10px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e40af')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            >
              Get Started Free →
            </button>
          </div>
        </div>

        {/* Right — contact form */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px' }}>✅</div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Message Sent!</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>We'll get back to you within 2 hours.</p>
              <button
                onClick={() => setSent(false)}
                style={{ padding: '10px 28px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Send a Message</p>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 24px' }}>How can we help you?</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Name + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Full Name *
                    </label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                      style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
                      onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
                      onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  >
                    <option value="">Select a topic…</option>
                    <option value="booking">Booking issue</option>
                    <option value="payment">Payment problem</option>
                    <option value="refund">Refund request</option>
                    <option value="complaint">Complaint</option>
                    <option value="partnership">Partnership enquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Message *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your issue or question in detail…"
                    rows={5}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', backgroundColor: '#f8fafc' }}
                    onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  style={{ padding: '13px 28px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e40af')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Message
                </button>

              </div>
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0f172a', padding: '32px 24px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#1d4ed8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '17px' }}>BusLink</span>
          </div>
          <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>
            © 2026 BusLink — Intelligent Bus Ticketing & Transport Management System
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} style={{ color: '#475569', fontSize: '13px', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}