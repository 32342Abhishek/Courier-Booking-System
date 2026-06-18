'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [trackingId, setTrackingId] = useState('');
  const router = useRouter();

  // Calculator state
  const [origin, setOrigin] = useState('Mumbai');
  const [destination, setDestination] = useState('Delhi');
  const [weight, setWeight] = useState(1);
  const [packageType, setPackageType] = useState('Parcel');
  const [fare, setFare] = useState(125);
  const [estDays, setEstDays] = useState(2);

  // Recalculate price when inputs change
  useEffect(() => {
    let baseRate = 50;
    if (packageType === 'Document') baseRate = 35;
    else if (packageType === 'Fragile') baseRate = 80;
    else if (packageType === 'Heavy') baseRate = 120;

    const weightCharge = Math.max(0.5, weight) * 20;
    const isSameCity = origin === destination;
    const distanceCharge = isSameCity ? 15 : 50;

    setFare(Math.round(baseRate + weightCharge + distanceCharge));
    setEstDays(isSameCity ? 1 : Math.max(2, (origin.length + destination.length) % 3 + 2));
  }, [origin, destination, weight, packageType]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) router.push(`/tracking?q=${trackingId.trim()}`);
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(circle 800px at 0% 0%, rgba(99, 102, 241, 0.16) 0%, transparent 80%),
          radial-gradient(circle 600px at 100% 0%, rgba(6, 182, 212, 0.1) 0%, transparent 80%),
          radial-gradient(circle 800px at 50% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 70%),
          var(--bg)
        `,
      }}>
        {/* Ambient Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div className="hero-grid">

            {/* Left */}
            <div style={{ animation: 'fadeUp .6s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 9999,
                border: '1px solid rgba(99,102,241,.2)',
                background: 'rgba(99,102,241,.06)',
                marginBottom: 28,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: 'blink 2s ease-in-out infinite', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.14em', color: '#a5b4fc' }}>
                  Next-Gen Courier Logistics
                </span>
              </div>

              <h1 style={{
                fontSize: 62, fontWeight: 900, lineHeight: 1.05,
                letterSpacing: '-.035em', color: 'var(--text)', marginBottom: 24,
              }}>
                Smart delivery,<br />
                <span className="gradient-text">
                  every second.
                </span>
              </h1>

              <p style={{
                fontSize: 16, lineHeight: 1.7, color: '#94a3b8',
                maxWidth: 460, marginBottom: 40,
              }}>
                Streamlined package booking and high-fidelity live shipment tracking. Engineered for reliability, built for speed.
              </p>

              <div style={{ display: 'flex', gap: 14, marginBottom: 48, flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Link
                    href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                    className="btn btn-primary"
                    style={{ padding: '14px 32px', fontSize: 14 }}
                  >
                    Go to Dashboard
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ) : (
                  <>
                    <Link href="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 14 }}>
                      Create Account
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                    <Link href="/login" className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: 14 }}>
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Quick track input */}
              <form onSubmit={handleTrack} style={{ display: 'flex', gap: 0, maxWidth: 440 }}>
                <input
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. TRK-1001)…"
                  className="input"
                  suppressHydrationWarning
                  style={{
                    flex: 1,
                    borderRight: 'none',
                    borderRadius: '12px 0 0 12px',
                    fontFamily: 'monospace',
                    fontSize: 14,
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  suppressHydrationWarning
                  style={{
                    borderRadius: '0 12px 12px 0',
                    padding: '0 28px',
                  }}
                >
                  Track
                </button>
              </form>
            </div>

            {/* Right — Generated Hero Image */}
            <div className="hero-card-wrap" style={{
              animation: 'float 6s ease-in-out infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <div className="glass" style={{
                padding: 12,
                borderRadius: 24,
                boxShadow: '0 30px 70px rgba(99,102,241,.12)',
                border: '1px solid var(--border2)',
                background: 'rgba(255, 255, 255, 0.01)',
                overflow: 'hidden',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-illustration.png"
                  alt="SwiftShip Logistics Illustration"
                  style={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    borderRadius: 16,
                    display: 'block',
                    opacity: 0.95,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.01)', backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[
              { value: '25K+', label: 'Deliveries Completed' },
              { value: '99.9%', label: 'On-Time Handover' },
              { value: '< 90s', label: 'Booking to Dispatch' },
              { value: '24 / 7', label: 'Active Live Tracking' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '36px 24px',
                textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,.05)' : 'none',
              }}>
                <p style={{ fontSize: 30, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.02em', marginBottom: 6, background: 'linear-gradient(135deg, var(--text) 30%, var(--muted) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Shipment Fare & Time Estimator (Live Calculator) ─────────────────────────── */}
      <section style={{ padding: '96px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.18em', color: '#6366f1', marginBottom: 12 }}>
            Instant Estimate
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.025em', marginBottom: 16 }}>
            Calculate Shipping Cost & Delivery Time
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 520, margin: '0 auto' }}>
            Get instant estimates on price and handling speed for standard, fragile, or heavy cargos.
          </p>
        </div>

        <div className="glass" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', overflow: 'hidden', padding: 0 }}>
          {/* Left inputs */}
          <div style={{ padding: 40, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 28, color: 'var(--text)' }}>Provide Package Logistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label className="label">Origin City</label>
                <select value={origin} onChange={e => setOrigin(e.target.value)} className="input" style={{ background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
                  {CITIES.map(c => <option key={c} value={c} style={{ background: 'var(--surface)', color: 'var(--text)' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Destination City</label>
                <select value={destination} onChange={e => setDestination(e.target.value)} className="input" style={{ background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
                  {CITIES.map(c => <option key={c} value={c} style={{ background: 'var(--surface)', color: 'var(--text)' }}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label className="label">Weight (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  max="500"
                  step="0.5"
                  value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value) || 1)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Cargo Category</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Document', 'Parcel', 'Fragile', 'Heavy'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPackageType(type)}
                      style={{
                        flex: 1,
                        padding: '10px 4px',
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: packageType === type ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--border)',
                        background: packageType === type ? 'rgba(99,102,241,0.12)' : 'var(--surface2)',
                        color: packageType === type ? 'var(--indigo)' : 'var(--muted)'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right outputs */}
          <div style={{ padding: 40, background: 'rgba(99, 102, 241, 0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '.1em', marginBottom: 4 }}>Estimated Fare</p>
              <p style={{ fontSize: 44, fontWeight: 900, color: 'var(--text)', fontFamily: 'monospace' }}>
                ₹{fare}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 20, marginBottom: 32, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <div>
                <p style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Transit Duration</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--indigo)' }}>{estDays} {estDays === 1 ? 'Day' : 'Days'}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>Service Level</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#06b6d4' }}>Standard Express</p>
              </div>
            </div>

            <Link href={isAuthenticated ? "/booking/new" : "/register"} className="btn btn-primary" style={{ width: '100%', padding: '14px', textAlign: 'center' }}>
              Book Shipment Now
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────────── */}
      <section style={{ padding: '96px 32px', borderTop: '1px solid rgba(255,255,255,.05)', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.18em', color: '#06b6d4', marginBottom: 12 }}>
            Features
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.025em', marginBottom: 14 }}>
            Tailored Courier Infrastructure
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 440, margin: '0 auto' }}>
            Full accountability and ease of management, from submission to final delivery.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo" style={{ color: '#6366f1' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ),
              title: 'Instant Online Booking',
              desc: 'Book a delivery request in under a minute. Pre-calculate fares, provide destinations, and generate dispatch tasks instantly.',
              accent: '#6366f1',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan" style={{ color: '#06b6d4' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              title: 'Live Telemetry & Timeline',
              desc: 'Every approved cargo is assigned a specific TRK serial. Trace state changes (Transit, Hold, Handover) with real-time status feeds.',
              accent: '#06b6d4',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald" style={{ color: '#10b981' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 11 2 2 4-4" />
                </svg>
              ),
              title: 'Granular Admin Control',
              desc: 'Full approval gatekeeping. Review weight metrics, sender details, cargo categorizations, and coordinate dispatch schedules.',
              accent: '#10b981',
            },
          ].map((f) => (
            <div key={f.title} className="glass-hover" style={{ padding: '36px 32px' }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${f.accent}12`,
                border: `1px solid ${f.accent}25`,
                marginBottom: 24,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it Works Section ─────────────────────────────────── */}
      <section style={{ padding: '96px 32px', borderTop: '1px solid rgba(255,255,255,.05)', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.18em', color: '#8b5cf6', marginBottom: 12 }}>
            Workflow
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.025em', marginBottom: 14 }}>
            Simple Four-Step Handover
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { num: '01', title: 'Submit Booking', desc: 'Input details regarding sender, receiver, and parcel categorization.' },
            { num: '02', title: 'Admin Evaluation', desc: 'Admins audit weight allocations, packaging structures, and authorize dispatch.' },
            { num: '03', title: 'In Transit', desc: 'Track routing milestones with automated tracking timeline logs.' },
            { num: '04', title: 'Secure Handover', desc: 'Consignee validation upon package delivery completion.' },
          ].map((step) => (
            <div key={step.num} className="glass" style={{ padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
              <span style={{
                position: 'absolute', right: -10, top: -20,
                fontSize: 84, fontWeight: 900,
                color: 'var(--border)', fontFamily: 'monospace', opacity: 0.15
              }}>{step.num}</span>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--indigo)', marginBottom: 20
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 96px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          borderRadius: 24,
          border: '1px solid rgba(99,102,241,.18)',
          background: 'linear-gradient(135deg, rgba(99,102,241,.05) 0%, rgba(6,182,212,.03) 100%)',
          padding: '72px 56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.02em', marginBottom: 10 }}>
              Empower Your Delivery Network
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 440, lineHeight: 1.6 }}>
              Set up your customer booking profile and organize courier orders within minutes. No initial deposit required.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {isAuthenticated ? (
              <Link
                href={user?.role === 'admin' ? '/admin' : '/booking/new'}
                className="btn btn-primary"
                style={{ padding: '14px 32px' }}
              >
                {user?.role === 'admin' ? 'Manage Bookings' : 'Book a Courier'}
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                  Create Account
                </Link>
                <Link href="/tracking" className="btn btn-ghost" style={{ padding: '14px 28px' }}>
                  Track Shipment
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,.3)',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-.01em' }}>SwiftShip</span>
          </div>
          <p style={{ fontSize: 12, color: '#475569' }} suppressHydrationWarning>© {new Date().getFullYear()} SwiftShip. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
