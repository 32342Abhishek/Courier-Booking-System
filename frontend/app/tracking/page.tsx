'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import { shipmentsAPI } from '@/lib/api';
import { Shipment } from '@/types';

const fmtDT = (d: string) => new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true });
const STATUSES = ['Approved','In Transit','Delivered'];
const TL_CLS: Record<string,string> = { 'Approved':'tl-approved', 'In Transit':'tl-transit', 'Delivered':'tl-delivered' };

function Content() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (sp.get('q')) search(sp.get('q')!); }, []);

  const search = async (val?: string) => {
    const v = (val ?? q).trim();
    if (!v) { setError('Please enter a tracking number.'); return; }
    setLoading(true); setError(''); setShipment(null);
    try { const r = await shipmentsAPI.track(v); setShipment(r.data.data); }
    catch (e:any) { setError(e.response?.data?.message || 'Shipment not found.'); }
    finally { setLoading(false); }
  };

  const booking = shipment?.booking && typeof shipment.booking === 'object' ? shipment.booking : null;
  const curIdx = STATUSES.indexOf(shipment?.status ?? '');
  const pct = curIdx === 0 ? 16 : curIdx === 1 ? 58 : 100;

  return (
    <div className="page-wrap">
      <div className="container-xs" style={{ maxWidth: 560 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'rgba(6,182,212,.1)', border:'1px solid rgba(6,182,212,.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:22 }}>🗺️</div>
          <h1 className="page-title" style={{ fontSize:26 }}>Track Your Shipment</h1>
          <p style={{ fontSize:13, color:'#64748b', marginTop:6 }}>Enter a tracking number for live status updates</p>
        </div>

        <form onSubmit={e=>{e.preventDefault();search();}} style={{ display:'flex', gap:8, marginBottom:28 }}>
          <input value={q} onChange={e=>{setQ(e.target.value);setError('');}} placeholder="e.g. TRK-1001" className="input" style={{ fontFamily:'monospace', fontSize:15 }} />
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flexShrink:0, padding:'0 20px' }}>
            {loading ? <div className="spinner" /> : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          </button>
        </form>
        {error && <div className="alert-error" style={{ marginBottom:20 }}><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</div>}

        {shipment && (
          <div style={{ display:'flex', flexDirection:'column', gap:14, animation:'fadeUp .4s ease' }}>
            {/* Overview */}
            <div className="glass" style={{ padding:22 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18 }}>
                <div>
                  <p style={{ fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>Tracking Number</p>
                  <p style={{ fontSize:26, fontWeight:800, color:'var(--text)', fontFamily:'monospace' }}>{shipment.trackingNumber}</p>
                </div>
                <StatusBadge status={shipment.status} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:'Created', value:fmtDT(shipment.createdAt) },
                  { label:'Status', value:shipment.status },
                  ...(booking ? [{ label:'Receiver', value:booking.receiverName }, { label:'Package', value:`${booking.packageType} — ${booking.packageWeight} kg` }] : []),
                ].map(({ label,value })=>(
                  <div key={label} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}>
                    <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'.08em', color:'#475569', marginBottom:4 }}>{label}</p>
                    <p style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="glass" style={{ padding:22 }}>
              <p className="section-title" style={{ marginBottom:20 }}>Delivery Progress</p>
              <div className="progress-bar" style={{ marginBottom:14 }}><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
              <div className="progress-steps">
                {STATUSES.map((s,i)=>{ const done=i<=curIdx; const cur=i===curIdx; return (
                  <div key={s} className="progress-step">
                    <div className={`progress-dot ${done?`done${cur?' current':''}`:' undone'}`}>{done?'✓':i+1}</div>
                    <span className="progress-label" style={{ color:done?'#cbd5e1':'#334155' }}>{s}</span>
                  </div>
                ); })}
              </div>
            </div>

            {/* Timeline */}
            {shipment.statusHistory?.length > 0 && (
              <div className="glass" style={{ padding:22 }}>
                <p className="section-title" style={{ marginBottom:20 }}>Activity Timeline</p>
                <div className="timeline">
                  <div className="timeline-line" />
                  {shipment.statusHistory.map((h,i)=>(
                    <div key={i} className="timeline-item">
                      <div className={`timeline-dot ${TL_CLS[h.status]||'tl-default'}`} style={{ fontSize: 12 }}>
                        {h.status==='Approved'?'✓':h.status==='In Transit'?'🚚':'📦'}
                      </div>
                      <div className="timeline-header">
                        <span className="timeline-status">{h.status}</span>
                        <span className="timeline-time">{fmtDT(h.timestamp)}</span>
                      </div>
                      {h.note && <p className="timeline-note">{h.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!shipment && !loading && !error && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#334155', fontSize:13 }}>📭 Enter a tracking number above to get started</div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spinner spinner-lg" /></div>}>
      <Content />
    </Suspense>
  );
}
