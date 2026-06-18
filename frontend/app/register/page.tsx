'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

type Role = 'customer' | 'admin';

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<Role>('customer');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', adminSecret: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent, isOtpSubmit = false) => {
    if (e) e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password || !form.confirm) {
      setError('Please fill in all required fields.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    if (role === 'admin' && !form.adminSecret.trim()) {
      setError('Admin secret key is required.'); return;
    }

    setBusy(true);
    try {
      if (role === 'admin') {
        // Call the create-admin endpoint
        await authAPI.createAdmin({
          name: form.name,
          email: form.email,
          password: form.password,
          adminSecret: form.adminSecret,
        });
        router.push('/login?registered=admin');
      } else {
        const res = await register(form.name, form.email, form.password, form.phone, isOtpSubmit ? otp : undefined);
        if (res && res.requireOtp) {
          setShowOtp(true);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const pw = form.password;
  const strength = !pw
    ? null
    : pw.length < 6
    ? { pct: '33%', color: '#ef4444', label: 'Weak' }
    : pw.length < 10
    ? { pct: '66%', color: '#f59e0b', label: 'Fair' }
    : { pct: '100%', color: '#10b981', label: 'Strong' };

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 460 }}>

        {/* Icon */}
        <div className="auth-icon">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-sub">Join SwiftShip as a customer or admin</p>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '24px 0 0' }}>
          {(['customer', 'admin'] as Role[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => { setRole(r); setError(''); }}
              style={{
                padding: '14px 12px',
                borderRadius: 12,
                border: `2px solid ${role === r ? (r === 'admin' ? '#f59e0b' : '#6366f1') : 'rgba(255,255,255,.08)'}`,
                background: role === r
                  ? r === 'admin' ? 'rgba(245,158,11,.1)' : 'rgba(99,102,241,.1)'
                  : 'rgba(255,255,255,.02)',
                color: role === r
                  ? r === 'admin' ? '#f59e0b' : '#818cf8'
                  : '#64748b',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: 13,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                transition: 'all .18s',
              }}
            >
              <span style={{ fontSize: 22 }}>{r === 'customer' ? '👤' : '🛡️'}</span>
              <span style={{ textTransform: 'capitalize' }}>{r}</span>
              <span style={{ fontSize: 11, fontWeight: 400, opacity: .7 }}>
                {r === 'customer' ? 'Book & track couriers' : 'Manage all bookings'}
              </span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="alert-error" style={{ marginTop: 16 }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <label className="label" htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text"
              value={form.name} onChange={handleChange}
              placeholder="John Doe"
              className="input" disabled={busy} required
            />
          </div>

          <div>
            <label className="label" htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              className="input" disabled={busy} required
            />
          </div>

          <div>
            <label className="label" htmlFor="phone">Phone Number</label>
            <input
              id="phone" name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              placeholder="+1234567890"
              className="input" disabled={busy} required
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="Min. 6 characters"
              className="input" disabled={busy} required
            />
            {strength && (
              <div style={{ marginTop: 8 }}>
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: strength.pct, background: strength.color }} />
                </div>
                <p className="strength-text">
                  Strength: <span style={{ color: strength.color }}>{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="label" htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm" name="confirm" type="password"
              value={form.confirm} onChange={handleChange}
              placeholder="Repeat password"
              className={`input${form.confirm && form.password !== form.confirm ? ' input-error' : ''}`}
              disabled={busy} required
            />
            {form.confirm && form.password !== form.confirm && (
              <p className="field-error">Passwords do not match</p>
            )}
          </div>

          {/* Admin secret — only shown when admin role is selected */}
          {role === 'admin' && (
            <div style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(245,158,11,.05)',
              border: '1px solid rgba(245,158,11,.2)',
            }}>
              <label className="label" htmlFor="adminSecret" style={{ color: '#f59e0b' }}>
                🔑 Admin Secret Key
              </label>
              <input
                id="adminSecret" name="adminSecret" type="password"
                value={form.adminSecret} onChange={handleChange}
                placeholder="Enter the admin secret key"
                className="input" disabled={busy}
                style={{ borderColor: 'rgba(245,158,11,.3)' }}
              />
              <p style={{ fontSize: 11, color: '#92400e', marginTop: 6 }}>
                This key is required to create an admin account. Contact your system administrator.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: 4,
              background: role === 'admin'
                ? 'linear-gradient(135deg, #d97706, #b45309)'
                : undefined,
              boxShadow: role === 'admin'
                ? '0 4px 16px rgba(217,119,6,.3)'
                : undefined,
            }}
          >
            {busy ? (
              <><div className="spinner" />Creating account…</>
            ) : (
              `Create ${role === 'admin' ? 'Admin' : 'Customer'} Account`
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#818cf8', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>

      {/* ── OTP Verification Modal ── */}
      {showOtp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            width: '100%', maxWidth: 380, background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 20, padding: 30,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center',
            position: 'relative'
          }}>
            <button 
              type="button"
              onClick={() => { setShowOtp(false); setOtp(''); }}
              style={{
                position: 'absolute', top: 20, right: 20,
                background: 'none', border: 'none', color: 'var(--muted)',
                cursor: 'pointer', fontSize: 18
              }}
            >✕</button>

            <div style={{
              width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18, margin: '0 auto 16px'
            }}>🔑</div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Enter Verification Code</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
              A 6-digit OTP code has been sent to <span style={{ color: 'var(--text)', fontWeight: 500 }}>{form.email}</span> and phone <span style={{ color: 'var(--text)', fontWeight: 500 }}>{form.phone}</span>
            </p>

            <form onSubmit={e => handleSubmit(e, true)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) setOtp(val);
                }}
                className="input"
                style={{
                  textAlign: 'center', fontSize: 24, letterSpacing: '8px',
                  fontWeight: 700, fontFamily: 'monospace', padding: '12px',
                  color: 'var(--text)', background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 10
                }}
                disabled={busy}
                required
              />

              {error && (
                <p style={{ fontSize: 12, color: 'var(--red)', margin: 0, textAlign: 'left' }}>
                  <span>✕</span> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || otp.length !== 6}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                {busy ? <><div className="spinner" />Verifying…</> : 'Verify & Register'}
              </button>

              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                Didn't receive code?{' '}
                <button
                  type="button"
                  onClick={e => handleSubmit(e, false)}
                  style={{
                    background: 'none', border: 'none', color: '#818cf8',
                    cursor: 'pointer', fontWeight: 600, padding: 0
                  }}
                >Resend OTP</button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
