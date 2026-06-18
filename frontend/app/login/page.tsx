'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  // Show success message if redirected after admin registration
  const justRegistered = searchParams.get('registered');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent, isOtpSubmit = false) => {
    if (e) e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setBusy(true);
    setError('');
    try {
      const res = await login(form.email, form.password, isOtpSubmit ? otp : undefined);
      if (res && res.requireOtp) {
        setShowOtp(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">

        <div className="auth-icon">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="auth-title">Sign in to SwiftShip</h1>
        <p className="auth-sub">Enter your credentials to continue</p>

        {/* Success message after admin registration */}
        {justRegistered === 'admin' && (
          <div className="alert-success" style={{ marginTop: 20 }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Admin account created! You can now sign in.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert-error" style={{ marginTop: 20 }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              className="input" disabled={busy} required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="••••••••"
              className="input" disabled={busy} required
            />
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: 4 }}>
            {busy ? <><div className="spinner" />Signing in…</> : 'Sign In'}
          </button>
        </form>

        {/* Admin secret hint */}
        <div className="demo-hint" style={{ marginTop: 20 }}>
          <p className="demo-title">Admin Secret Key</p>
          <div className="demo-row">
            <span>Key</span>
            <span className="demo-val">courier_system_super_secret_jwt_key_2024</span>
          </div>
          <p style={{ fontSize: 11, color: '#334155', marginTop: 6 }}>
            Use this key when registering as admin at /register
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#818cf8', fontWeight: 600 }}>Create one</Link>
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
              A 6-digit OTP code has been sent to <span style={{ color: 'var(--text)', fontWeight: 500 }}>{form.email}</span> (and registered phone)
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
                {busy ? <><div className="spinner" />Verifying…</> : 'Verify & Sign In'}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-wrap"><div className="spinner spinner-lg" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
