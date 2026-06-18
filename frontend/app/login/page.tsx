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

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
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
