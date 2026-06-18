type Status = 'Pending' | 'Approved' | 'Rejected' | 'In Transit' | 'Delivered';
const MAP: Record<Status, { cls: string; dot: string }> = {
  'Pending':    { cls: 'badge badge-pending',   dot: '#f59e0b' },
  'Approved':   { cls: 'badge badge-approved',  dot: '#10b981' },
  'Rejected':   { cls: 'badge badge-rejected',  dot: '#ef4444' },
  'In Transit': { cls: 'badge badge-transit',   dot: '#60a5fa' },
  'Delivered':  { cls: 'badge badge-delivered', dot: '#8b5cf6' },
};
export default function StatusBadge({ status }: { status: Status }) {
  const c = MAP[status] ?? { cls: 'badge', dot: '#94a3b8' };
  return (
    <span className={c.cls}>
      <span className="badge-dot" style={{ background: c.dot, animation: status === 'Pending' ? 'pulse 2s ease-in-out infinite' : 'none' }} />
      {status}
    </span>
  );
}
