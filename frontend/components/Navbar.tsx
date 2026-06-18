'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = user?.role === 'admin'
    ? [{ href: '/admin', label: 'Admin Panel' }, { href: '/tracking', label: 'Track' }]
    : isAuthenticated
    ? [{ href: '/dashboard', label: 'Dashboard' }, { href: '/booking/new', label: 'New Booking' }, { href: '/tracking', label: 'Track' }]
    : [{ href: '/', label: 'Home' }, { href: '/tracking', label: 'Track' }];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
          </div>
          Swift<span style={{ color: '#818cf8' }}>Ship</span>
        </Link>

        <div className="nav-links">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link ${pathname === l.href ? 'active' : ''}`}>{l.label}</Link>
          ))}
        </div>

        <div className="nav-auth">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s, transform 0.2s',
              marginRight: 4
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {isAuthenticated ? (
            <>
              <div className="nav-user">
                <div className="nav-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                <div className="nav-user-info" style={{ display: 'none' }}>
                  <p>{user?.name}</p>
                  <p>{user?.role}</p>
                </div>
                <div className="nav-user-info" style={{ lineHeight: 1.3 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</p>
                </div>
              </div>
              <button onClick={logout} className="btn btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ fontSize: 13, color: '#94a3b8', padding: '0 8px' }} className="nav-link">Sign in</Link>
              <Link href="/register" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 18px' }}>Get Started</Link>
            </>
          )}
        </div>

        <button className="nav-mobile-btn" onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 8 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-mobile)',
          backdropFilter: 'blur(20px)',
          padding: '16px 24px 20px',
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          animation: 'fadeUp .25s ease both',
          zIndex: 99
        }}>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`nav-link ${pathname === l.href ? 'active' : ''}`}
              style={{ display: 'block', marginBottom: 8, padding: '10px 14px' }}
            >
              {l.label}
            </Link>
          ))}
          {/* Mobile Theme Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: '1px solid var(--border)',
            marginBottom: 12,
            marginTop: 8
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>Theme Mode</span>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              {theme === 'dark' ? (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              ) : (
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          {isAuthenticated ? (
            <button
              onClick={logout}
              style={{
                marginTop: 12,
                width: '100%',
                background: 'rgba(239,68,68,.08)',
                border: '1px solid rgba(239,68,68,.2)',
                borderRadius: '8px',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: 13,
                padding: '10px 0',
                fontWeight: 600,
                textAlign: 'center',
                fontFamily: 'inherit'
              }}
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="btn btn-primary"
              style={{ marginTop: 12, display: 'block', textAlign: 'center', padding: '10px' }}
            >
              Get Started
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
