'use client';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatusBadge from '@/components/StatusBadge';
import { bookingsAPI, shipmentsAPI } from '@/lib/api';
import { Booking, Shipment, User } from '@/types';

type Tab = 'bookings' | 'shipments';
const NEXT: Record<string, string> = { Approved: 'In Transit', 'In Transit': 'Delivered' };
const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/* ─── Inline styles ──────────────────────────────────────────────────────── */
const S = {
  // Layout
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    padding: '32px 24px 64px',
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
  } as React.CSSProperties,
  container: { maxWidth: 1200, margin: '0 auto' } as React.CSSProperties,

  // Header
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: 16,
    marginBottom: 36,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(139,92,246,.12)',
    border: '1px solid rgba(139,92,246,.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  pageSub: { fontSize: 13, color: 'var(--muted)', marginTop: 2 },

  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14,
    marginBottom: 28,
  },
  statCard: (color: string): React.CSSProperties => ({
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'border-color .2s, transform .2s',
    cursor: 'default',
    borderTop: `3px solid ${color}`,
  }),
  statIconWrap: (color: string): React.CSSProperties => ({
    width: 38,
    height: 38,
    borderRadius: 10,
    background: color + '18',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
  }),
  statLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.08em',
    color: 'var(--muted)',
  },
  statValue: (color: string): React.CSSProperties => ({
    fontSize: 32,
    fontWeight: 700,
    color,
    lineHeight: 1,
    letterSpacing: '-1px',
  }),

  // Tabs
  tabsWrap: {
    display: 'flex',
    gap: 4,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 4,
    width: 'fit-content',
    marginBottom: 20,
  },
  tab: (active: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: active ? 'var(--surface2)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--muted)',
    textTransform: 'capitalize' as const,
    transition: 'all .15s',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
  }),

  // Controls
  controlsRow: { display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' as const },
  searchWrap: { flex: 1, minWidth: 260, position: 'relative' as const },
  searchIcon: {
    position: 'absolute' as const,
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--muted)',
    fontSize: 15,
    pointerEvents: 'none' as const,
  },
  input: {
    width: '100%',
    padding: '9px 12px 9px 36px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text)',
    fontSize: 13,
    outline: 'none',
  } as React.CSSProperties,
  select: {
    padding: '9px 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text)',
    fontSize: 13,
    outline: 'none',
    cursor: 'pointer',
    minWidth: 160,
    appearance: 'none' as const,
  },

  // Table card
  tableCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 22px',
    borderBottom: '1px solid var(--border)',
  },
  tableTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  tableCount: { fontSize: 12, color: 'var(--muted)' },
  th: {
    padding: '10px 18px',
    textAlign: 'left' as const,
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.08em',
    color: 'var(--muted)',
    background: 'var(--surface2)',
    whiteSpace: 'nowrap' as const,
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '13px 18px',
    borderBottom: '1px solid var(--border)',
    fontSize: 13,
    color: 'var(--muted)',
    verticalAlign: 'middle' as const,
  },

  // Chips
  bookingChip: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#a78bfa',
    background: 'rgba(139,92,246,.1)',
    padding: '3px 8px',
    borderRadius: 6,
    display: 'inline-block',
  },
  trackChip: {
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: 12,
    color: '#34d399',
    background: 'rgba(52,211,153,.08)',
    padding: '3px 9px',
    borderRadius: 6,
    display: 'inline-block',
  },

  // Buttons
  btnApprove: {
    padding: '5px 13px',
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 8,
    border: '1px solid rgba(52,211,153,.25)',
    background: 'rgba(52,211,153,.08)',
    color: '#34d399',
    cursor: 'pointer',
    transition: 'all .15s',
  } as React.CSSProperties,
  btnReject: {
    padding: '5px 13px',
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 8,
    border: '1px solid rgba(248,113,113,.25)',
    background: 'rgba(248,113,113,.08)',
    color: '#f87171',
    cursor: 'pointer',
    transition: 'all .15s',
  } as React.CSSProperties,
  btnNext: {
    padding: '5px 13px',
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--surface2)',
    color: 'var(--muted)',
    cursor: 'pointer',
    transition: 'all .15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  } as React.CSSProperties,
 
  // Toast
  toast: (type: 'success' | 'error'): React.CSSProperties => ({
    position: 'fixed',
    bottom: 28,
    right: 28,
    padding: '12px 18px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    zIndex: 999,
    background: type === 'success' ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)',
    border: `1px solid ${type === 'success' ? 'rgba(52,211,153,.25)' : 'rgba(248,113,113,.25)'}`,
    color: type === 'success' ? '#34d399' : '#f87171',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0,0,0,.4)',
    animation: 'slideUp .25s ease',
  }),
 
  // Modal
  backdrop: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    margin: 16,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 18,
    padding: 28,
    animation: 'scaleIn .2s ease',
  },
  modalTitle: { fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 8 },
  modalDesc: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 22 },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: 10 },
  btnCancel: {
    padding: '8px 18px',
    fontSize: 13,
    borderRadius: 9,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--muted)',
    cursor: 'pointer',
  } as React.CSSProperties,
 
  // Misc
  emptyState: { textAlign: 'center' as const, padding: '60px 20px', fontSize: 13, color: 'var(--muted)' },
  deliveredTag: { fontSize: 12, color: '#34d399', fontWeight: 600 },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '2.5px solid rgba(139,92,246,.15)',
    borderTopColor: '#8b5cf6',
    animation: 'spin 0.7s linear infinite',
    margin: '80px auto',
    display: 'block',
  },
};

/* ─── Status Badge ───────────────────────────────────────────────────────── */
const statusConfig: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  Pending: { bg: 'rgba(251,191,36,.08)', color: '#fbbf24', dot: '#fbbf24', label: 'Pending' },
  Approved: { bg: 'rgba(96,165,250,.08)', color: '#60a5fa', dot: '#60a5fa', label: 'Approved' },
  Rejected: { bg: 'rgba(248,113,113,.08)', color: '#f87171', dot: '#f87171', label: 'Rejected' },
  'In Transit': { bg: 'rgba(167,139,250,.08)', color: '#a78bfa', dot: '#a78bfa', label: 'In Transit' },
  Delivered: { bg: 'rgba(52,211,153,.08)', color: '#34d399', dot: '#34d399', label: 'Delivered' },
};

function Pill({ status }: { status: string }) {
  const c = statusConfig[status] ?? statusConfig.Pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: c.bg, color: c.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

/* ─── Confirm Modal ──────────────────────────────────────────────────────── */
type ModalCfg = {
  isOpen: boolean;
  id: string;
  type: 'approve' | 'reject' | 'status-update';
  status?: string;
  title: string;
  desc: string;
};

function ConfirmModal({ cfg, onCancel, onConfirm }: {
  cfg: ModalCfg;
  onCancel: () => void;
  onConfirm: (id: string, type: string, status?: string) => void;
}) {
  if (!cfg.isOpen) return null;
  const isDanger = cfg.type === 'reject';
  const confirmStyle: React.CSSProperties = {
    padding: '8px 18px', fontSize: 13, fontWeight: 500, borderRadius: 9, cursor: 'pointer',
    border: isDanger ? '1px solid rgba(248,113,113,.3)' : '1px solid rgba(139,92,246,.3)',
    background: isDanger ? 'rgba(248,113,113,.1)' : 'rgba(139,92,246,.1)',
    color: isDanger ? '#f87171' : '#a78bfa',
  };
  return (
    <div style={S.backdrop} onClick={onCancel}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <p style={S.modalTitle}>{cfg.title}</p>
        <p style={S.modalDesc}>{cfg.desc}</p>
        <div style={S.modalBtns}>
          <button style={S.btnCancel} onClick={onCancel}>Cancel</button>
          <button style={confirmStyle} onClick={() => onConfirm(cfg.id, cfg.type, cfg.status)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main content ───────────────────────────────────────────────────────── */
function Content() {
  const [tab, setTab] = useState<Tab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actId, setActId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<ModalCfg | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    try {
      const [br, sr] = await Promise.all([bookingsAPI.getAllBookings(), shipmentsAPI.getAll()]);
      setBookings(br.data.data);
      setShipments(sr.data.data);
    } catch {
      showToast('Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approveAction = async (id: string) => {
    setActId(id);
    try { await bookingsAPI.approve(id); showToast('Booking approved — tracking number generated.'); load(); }
    catch (e: any) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setActId(null); }
  };

  const rejectAction = async (id: string) => {
    setActId(id);
    try { await bookingsAPI.reject(id); showToast('Booking rejected.'); load(); }
    catch (e: any) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setActId(null); }
  };

  const updateStatusAction = async (shipId: string, status: string) => {
    setActId(shipId);
    try { await shipmentsAPI.updateStatus(shipId, status); showToast(`Status updated to "${status}"`); load(); }
    catch (e: any) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
    finally { setActId(null); }
  };

  const handleConfirm = (id: string, type: string, status?: string) => {
    setConfirmModal(null);
    if (type === 'approve') approveAction(id);
    else if (type === 'reject') rejectAction(id);
    else if (type === 'status-update' && status) updateStatusAction(id, status);
  };

  const handleTabChange = (t: Tab) => {
    setTab(t); setSearchQuery(''); setStatusFilter('All'); setSortBy('newest');
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, color: '#8b5cf6', icon: '📋' },
    { label: 'Pending Review', value: bookings.filter(b => b.status === 'Pending').length, color: '#fbbf24', icon: '⏳' },
    { label: 'Active Shipments', value: shipments.filter(s => s.status !== 'Delivered').length, color: '#60a5fa', icon: '🚚' },
    { label: 'Delivered', value: shipments.filter(s => s.status === 'Delivered').length, color: '#34d399', icon: '✓' },
  ];

  /* Sorting & filtering */
  const sortFn = (a: any, b: any) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'weight-desc') return b.packageWeight - a.packageWeight;
    if (sortBy === 'weight-asc') return a.packageWeight - b.packageWeight;
    return 0;
  };

  const filteredBookings = [...bookings].sort(sortFn).filter(b => {
    const cust = typeof b.customer === 'object' ? b.customer as User : null;
    const q = searchQuery.toLowerCase();
    return (
      (b.bookingId.toLowerCase().includes(q) || b.receiverName.toLowerCase().includes(q) ||
        b.senderName.toLowerCase().includes(q) || (cust?.name || '').toLowerCase().includes(q) ||
        (cust?.email || '').toLowerCase().includes(q) || b.packageType.toLowerCase().includes(q)) &&
      (statusFilter === 'All' || b.status === statusFilter)
    );
  });

  const filteredShipments = [...shipments].sort(sortFn).filter(s => {
    const bk = typeof s.booking === 'object' ? s.booking as Booking : null;
    const q = searchQuery.toLowerCase();
    return (
      (s.trackingNumber.toLowerCase().includes(q) || (bk?.bookingId || '').toLowerCase().includes(q) ||
        (bk?.receiverName || '').toLowerCase().includes(q)) &&
      (statusFilter === 'All' || s.status === statusFilter)
    );
  });

  return (
    <>
      {/* Global keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
        input::placeholder { color: var(--subtle) !important; }
        input:focus, select:focus { border-color: var(--indigo) !important; box-shadow: 0 0 0 3px rgba(139,92,246,.08) !important; }
        tbody tr:hover td { background: rgba(99,102,241,.04) !important; }
      `}</style>

      <div style={S.page}>
        <div style={S.container}>

          {/* Toast */}
          {toast && (
            <div style={S.toast(toast.type)}>
              <span>{toast.type === 'success' ? '✓' : '✗'}</span>
              {toast.msg}
            </div>
          )}

          {/* Modal */}
          {confirmModal && (
            <ConfirmModal
              cfg={confirmModal}
              onCancel={() => setConfirmModal(null)}
              onConfirm={handleConfirm}
            />
          )}

          {/* Page Header */}
          <div style={S.headerRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <div style={S.iconBadge}>🛡️</div>
                <h1 style={S.pageTitle}>Admin Panel</h1>
              </div>
              <p style={S.pageSub}>Manage all bookings and shipments</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, fontSize: 12, color: 'var(--muted)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
              Live data
            </div>
          </div>

          {/* Stats */}
          <div style={S.statsGrid}>
            {stats.map(s => (
              <div key={s.label} style={S.statCard(s.color)}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.borderColor = s.color + '40'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={S.statIconWrap(s.color)}>{s.icon}</div>
                  <span style={S.statLabel}>{s.label}</span>
                </div>
                <p style={S.statValue(s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={S.tabsWrap}>
            {(['bookings', 'shipments'] as Tab[]).map(t => (
              <button key={t} style={S.tab(tab === t)} onClick={() => handleTabChange(t)}>
                {t}
                <span style={{ opacity: .45, fontSize: 11, marginLeft: 4 }}>
                  ({t === 'bookings' ? bookings.length : shipments.length})
                </span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={S.controlsRow}>
            <div style={S.searchWrap}>
              <span style={S.searchIcon}>🔍</span>
              <input
                type="text"
                style={S.input}
                placeholder={tab === 'bookings' ? 'Search ID, customer, sender, receiver…' : 'Search tracking number, booking ID…'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select style={S.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              {tab === 'bookings' ? (
                <>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </>
              ) : (
                <>
                  <option value="Approved">Approved</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </>
              )}
            </select>
            <select style={S.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              {tab === 'bookings' && (
                <>
                  <option value="weight-desc">Weight (high → low)</option>
                  <option value="weight-asc">Weight (low → high)</option>
                </>
              )}
            </select>
          </div>

          {/* ── Bookings Table ── */}
          {tab === 'bookings' && (
            <div style={S.tableCard}>
              <div style={S.tableHeader}>
                <span style={S.tableTitle}>All Bookings</span>
                <span style={S.tableCount}>
                  {filteredBookings.length === bookings.length
                    ? `${bookings.length} total`
                    : `${filteredBookings.length} of ${bookings.length}`}
                </span>
              </div>
              {loading ? (
                <div style={S.spinner} />
              ) : filteredBookings.length === 0 ? (
                <div style={S.emptyState}>No bookings found</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Booking ID', 'Customer', 'Sender', 'Receiver', 'Package', 'Weight', 'Price', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(b => {
                        const cust = typeof b.customer === 'object' ? b.customer as User : null;
                        const acting = actId === b._id;
                        const isHovered = hoveredRow === b._id;
                        return (
                          <tr key={b._id}
                            onMouseEnter={() => setHoveredRow(b._id)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            <td style={S.td}><span style={S.bookingChip}>{b.bookingId}</span></td>
                            <td style={S.td}>
                              <p style={{ color: '#e2e8f0', fontWeight: 500, fontSize: 13, margin: 0 }}>{cust?.name ?? '—'}</p>
                              <p style={{ color: '#334155', fontSize: 11, marginTop: 2 }}>{cust?.email}</p>
                            </td>
                            <td style={S.td}>{b.senderName}</td>
                            <td style={{ ...S.td, color: '#cbd5e1', fontWeight: 500 }}>{b.receiverName}</td>
                            <td style={S.td}>{b.packageType}</td>
                            <td style={S.td}>{b.packageWeight} kg</td>
                            <td style={{ ...S.td, fontFamily: 'monospace' }}>₹{b.calculatedPrice || 0}</td>
                            <td style={S.td}>
                              <span style={{ 
                                fontSize: 11, 
                                background: b.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', 
                                color: b.paymentStatus === 'Paid' ? '#34d399' : '#f87171', 
                                padding: '3px 8px', 
                                borderRadius: 6, 
                                fontWeight: 500 
                              }}>
                                {b.paymentStatus === 'Paid' ? `Paid (${b.paymentMethod || 'Card'})` : 'Unpaid'}
                              </span>
                            </td>
                            <td style={S.td}><Pill status={b.status} /></td>
                            <td style={{ ...S.td, fontSize: 11, color: '#334155' }}>{fmt(b.createdAt)}</td>
                            <td style={S.td}>
                              {b.status === 'Pending' ? (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button
                                    style={S.btnApprove} disabled={acting}
                                    onClick={() => setConfirmModal({ isOpen: true, id: b._id, type: 'approve', title: 'Approve booking', desc: 'Approving this booking will generate a tracking number and initialise the shipment.' })}
                                  >
                                    {acting ? '…' : 'Approve'}
                                  </button>
                                  <button
                                    style={S.btnReject} disabled={acting}
                                    onClick={() => setConfirmModal({ isOpen: true, id: b._id, type: 'reject', title: 'Reject booking', desc: 'Are you sure you want to reject this booking? This action cannot be undone.' })}
                                  >
                                    {acting ? '…' : 'Reject'}
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: 11, color: '#1e293b' }}>
                                  {b.status === 'Approved' ? 'Shipment created' : 'Rejected'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Shipments Table ── */}
          {tab === 'shipments' && (
            <div style={S.tableCard}>
              <div style={S.tableHeader}>
                <span style={S.tableTitle}>All Shipments</span>
                <span style={S.tableCount}>
                  {filteredShipments.length === shipments.length
                    ? `${shipments.length} total`
                    : `${filteredShipments.length} of ${shipments.length}`}
                </span>
              </div>
              {loading ? (
                <div style={S.spinner} />
              ) : filteredShipments.length === 0 ? (
                <div style={S.emptyState}>No shipments found. Approve a booking to create one.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Tracking No.', 'Booking ID', 'Receiver', 'Package', 'Status', 'Created', 'Action'].map(h => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShipments.map(s => {
                        const bk = typeof s.booking === 'object' ? s.booking as Booking : null;
                        const acting = actId === s._id;
                        const next = NEXT[s.status];
                        return (
                          <tr key={s._id}
                            onMouseEnter={() => setHoveredRow(s._id)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            <td style={S.td}><span style={S.trackChip}>{s.trackingNumber}</span></td>
                            <td style={S.td}><span style={S.bookingChip}>{bk?.bookingId ?? '—'}</span></td>
                            <td style={{ ...S.td, color: '#cbd5e1', fontWeight: 500 }}>{bk?.receiverName ?? '—'}</td>
                            <td style={S.td}>{bk ? `${bk.packageType} · ${bk.packageWeight} kg` : '—'}</td>
                            <td style={S.td}><Pill status={s.status} /></td>
                            <td style={{ ...S.td, fontSize: 11, color: '#334155' }}>{fmt(s.createdAt)}</td>
                            <td style={S.td}>
                              {next ? (
                                <button
                                  style={S.btnNext} disabled={acting}
                                  onClick={() => setConfirmModal({ isOpen: true, id: s._id, type: 'status-update', status: next, title: 'Update shipment status', desc: `Confirm updating this shipment's status to "${next}"?` })}
                                >
                                  {acting ? 'Updating…' : <>→ {next}</>}
                                </button>
                              ) : (
                                <span style={S.deliveredTag}>✓ Delivered</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default function AdminPage() {
  return <ProtectedRoute requiredRole="admin"><Content /></ProtectedRoute>;
}