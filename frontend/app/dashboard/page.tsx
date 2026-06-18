'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsAPI } from '@/lib/api';
import { Booking } from '@/types';

const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

function Content() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    bookingsAPI.getMyBookings().then(r => setBookings(r.data.data))
      .catch((e: any) => setError(e.response?.data?.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total', value: bookings.length, color: '#6366f1', icon: '📦' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, color: '#f59e0b', icon: '⏳' },
    { label: 'Approved', value: bookings.filter(b => b.status === 'Approved').length, color: '#10b981', icon: '✓' },
    { label: 'Rejected', value: bookings.filter(b => b.status === 'Rejected').length, color: '#ef4444', icon: '✗' },
  ];

  const filteredBookings = bookings.filter(b => {
    const ship = typeof b.shipment === 'object' ? b.shipment : null;
    const trackingNo = ship?.trackingNumber || '';
    const matchesSearch = 
      b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trackingNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.packageType.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-wrap">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-sub">Welcome back, <span style={{ color: '#818cf8', fontWeight: 600 }}>{user?.name}</span></p>
          </div>
          <Link href="/booking/new" className="btn btn-primary">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Booking
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {stats.map(s => (
            <div 
              key={s.label} 
              className="glass" 
              style={{ 
                padding: '20px 24px', 
                borderLeft: `4px solid ${s.color}`, 
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: `0 8px 30px rgba(0, 0, 0, 0.2)`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 15px 30px ${s.color}15`;
                e.currentTarget.style.borderColor = s.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 30px rgba(0, 0, 0, 0.2)`;
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: s.color }}>{s.label}</span>
              </div>
              <p className="stat-num" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Controls: Search and filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <input 
              type="text" 
              placeholder="Search by ID, receiver, package, or tracking number..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input"
              style={{ appearance: 'none', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer' }}
            >
              <option value="All" style={{ background: 'var(--surface)', color: 'var(--text)' }}>All Statuses</option>
              <option value="Pending" style={{ background: 'var(--surface)', color: 'var(--text)' }}>Pending</option>
              <option value="Approved" style={{ background: 'var(--surface)', color: 'var(--text)' }}>Approved</option>
              <option value="In Transit" style={{ background: 'var(--surface)', color: 'var(--text)' }}>In Transit</option>
              <option value="Delivered" style={{ background: 'var(--surface)', color: 'var(--text)' }}>Delivered</option>
              <option value="Rejected" style={{ background: 'var(--surface)', color: 'var(--text)' }}>Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <div className="section-header">
            <span className="section-title">My Bookings</span>
            <span style={{ fontSize: 12, color: '#475569' }}>
              {filteredBookings.length === bookings.length 
                ? `${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'}`
                : `Found ${filteredBookings.length} of ${bookings.length}`
              }
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#fca5a5', fontSize: 13 }}>{error}</div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>No bookings yet</p>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Create your first booking to get started</p>
              <Link href="/booking/new" className="btn btn-primary" style={{ fontSize: 13 }}>Create Booking</Link>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b', fontSize: 13 }}>
              No bookings matched your search filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>Booking ID</th><th>Receiver</th><th>Package Type</th>
                  <th>Weight</th><th>Price</th><th>Payment</th><th>Status</th><th>Tracking No.</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {filteredBookings.map(b => {
                    const ship = typeof b.shipment === 'object' ? b.shipment : null;
                    return (
                      <tr key={b._id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#818cf8', background: 'rgba(99,102,241,.1)', padding: '3px 8px', borderRadius: 6 }}>{b.bookingId}</span></td>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{b.receiverName}</td>
                        <td>{b.packageType}</td>
                        <td>{b.packageWeight} kg</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>₹{b.calculatedPrice || 0}</td>
                        <td>
                          <span style={{ 
                            fontSize: 11, 
                            background: b.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', 
                            color: b.paymentStatus === 'Paid' ? '#10b981' : '#ef4444', 
                            padding: '3px 8px', 
                            borderRadius: 6, 
                            fontWeight: 500 
                          }}>
                            {b.paymentStatus === 'Paid' ? `Paid (${b.paymentMethod || 'Card'})` : 'Unpaid'}
                          </span>
                        </td>
                        <td><StatusBadge status={b.status} /></td>
                        <td>{ship
                          ? <Link href={`/tracking?q=${ship.trackingNumber}`} style={{ fontFamily: 'monospace', fontSize: 11, color: '#22d3ee', textDecoration: 'underline' }}>{ship.trackingNumber}</Link>
                          : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                        <td style={{ color: '#475569', fontSize: 11 }}>{fmt(b.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute requiredRole="customer"><Content /></ProtectedRoute>;
}
