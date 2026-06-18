'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { bookingsAPI } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────
interface FormData {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageType: string;
  packageWeight: string;
}

interface FormErrors {
  senderName?: string;
  senderPhone?: string;
  senderAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  packageType?: string;
  packageWeight?: string;
  packageImage?: string;
}

const PACKAGE_TYPES = [
  { id: 'Document', icon: '📄', desc: 'Letters & papers', rate: 35 },
  { id: 'Parcel', icon: '📦', desc: 'Standard packages', rate: 50 },
  { id: 'Fragile', icon: '🔮', desc: 'Handle with care', rate: 80 },
  { id: 'Heavy', icon: '⚖️', desc: 'Large / bulky', rate: 120 },
];

const INITIAL_FORM: FormData = {
  senderName: '', senderPhone: '', senderAddress: '',
  receiverName: '', receiverPhone: '', receiverAddress: '',
  packageType: '', packageWeight: '',
};

const phoneRegex = /^[0-9+\-\s()]{7,15}$/;

// ── Design tokens ──────────────────────────────────────────────
const T = {
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  surfaceHov: 'var(--surface2)',
  border: 'var(--border)',
  borderHov: 'var(--indigo)',
  text: 'var(--text)',
  muted: 'var(--muted)',
  subtle: 'var(--surface2)',
  accent: 'var(--indigo)',
  accentLow: 'rgba(99,102,241,.1)',
  accentBorder: 'var(--border2)',
  green: 'var(--emerald)',
  greenLow: 'rgba(16,185,129,.08)',
  greenBorder: 'rgba(16,185,129,.2)',
  red: 'var(--red)',
  redLow: 'rgba(239,68,68,.08)',
  redBorder: 'rgba(239,68,68,.2)',
  cyan: 'var(--cyan)',
};

// ── Shared styles ──────────────────────────────────────────────
const base: React.CSSProperties = {
  fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
};

const inputStyle = (hasError = false): React.CSSProperties => ({
  width: '100%',
  padding: '10px 14px',
  background: T.subtle,
  border: `1px solid ${hasError ? T.redBorder : T.border}`,
  borderRadius: 10,
  color: T.text,
  fontSize: 13,
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
  boxSizing: 'border-box',
});

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '.07em',
  color: T.muted,
  marginBottom: 7,
};

const fieldErrorStyle: React.CSSProperties = {
  fontSize: 11,
  color: T.red,
  marginTop: 5,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

// ── Section component ──────────────────────────────────────────
function Section({
  title, icon, children, step,
}: {
  title: string; icon: string; children: React.ReactNode; step: number;
}) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 22px',
        borderBottom: `1px solid ${T.border}`,
        background: 'rgba(255,255,255,.015)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: T.accentLow,
          border: `1px solid ${T.accentBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          flexShrink: 0,
        }}>{icon}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, fontFamily: 'monospace' }}>
            {String(step).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{title}</span>
        </div>
      </div>
      {/* Section body */}
      <div style={{ padding: '22px' }}>
        {children}
      </div>
    </div>
  );
}

// ── Field component ─────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={fieldErrorStyle}><span>✕</span>{error}</p>}
    </div>
  );
}

// ── Success screen ─────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div style={{
      ...base, minHeight: '100vh', background: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: T.greenLow, border: `2px solid ${T.greenBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 34, color: T.green,
        }}>✓</div>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.5px' }}>
          Booking Created!
        </h2>
        <p style={{ color: T.muted, fontSize: 13 }}>Redirecting to your dashboard…</p>
      </div>
    </div>
  );
}

// ── Main booking form ──────────────────────────────────────────
function BookingForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [packageImage, setPackageImage] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getRatePerKg = (type: string) => {
    return PACKAGE_TYPES.find(t => t.id === type)?.rate ?? 0;
  };

  const currentRate = getRatePerKg(form.packageType);
  const weightVal = parseFloat(form.packageWeight) || 0;
  const totalPrice = Math.round(weightVal * currentRate);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const selectPackageType = (type: string) => {
    setForm(prev => ({ ...prev, packageType: type }));
    setErrors(prev => ({ ...prev, packageType: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrors(prev => ({ ...prev, packageImage: '' }));
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, packageImage: 'Image size should not exceed 2MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPackageImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setPackageImage('');

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.senderName.trim()) e.senderName = 'Sender name is required';
    if (!form.senderPhone.trim()) e.senderPhone = 'Sender phone is required';
    else if (!phoneRegex.test(form.senderPhone)) e.senderPhone = 'Enter a valid phone number';
    if (!form.senderAddress.trim()) e.senderAddress = 'Sender address is required';
    if (!form.receiverName.trim()) e.receiverName = 'Receiver name is required';
    if (!form.receiverPhone.trim()) e.receiverPhone = 'Receiver phone is required';
    else if (!phoneRegex.test(form.receiverPhone)) e.receiverPhone = 'Enter a valid phone number';
    if (!form.receiverAddress.trim()) e.receiverAddress = 'Receiver address is required';
    if (!form.packageType) e.packageType = 'Please select a package type';
    const weight = parseFloat(form.packageWeight);
    if (!form.packageWeight) e.packageWeight = 'Weight is required';
    else if (isNaN(weight) || weight <= 0) e.packageWeight = 'Weight must be greater than 0';
    else if (weight > 1000) e.packageWeight = 'Maximum weight is 1000 kg';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await bookingsAPI.create({
        ...form,
        packageWeight: parseFloat(form.packageWeight),
        packageImage,
        calculatedPrice: totalPrice,
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen />;

  const getFocusStyle = (name: string, hasError = false): React.CSSProperties => ({
    ...inputStyle(hasError),
    borderColor: hasError ? T.redBorder : focusedField === name ? T.accentBorder : T.border,
    boxShadow: focusedField === name && !hasError ? `0 0 0 3px ${T.accentLow}` : 'none',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #334155 !important; font-size: 13px; }
        textarea { font-family: inherit; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 4px; }
      `}</style>

      <div style={{ ...base, minHeight: '100vh', background: T.bg, padding: '36px 20px 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* ── Back + Header ── */}
          <div style={{ marginBottom: 32 }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                background: 'none', border: 'none', color: T.muted,
                cursor: 'pointer', fontSize: 13, display: 'inline-flex',
                alignItems: 'center', gap: 6, marginBottom: 20,
                fontFamily: 'inherit', padding: 0,
                transition: 'color .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = T.text)}
              onMouseLeave={e => (e.currentTarget.style.color = T.muted)}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13,
                background: T.accentLow, border: `1px solid ${T.accentBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>📦</div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>
                  New Booking
                </h1>
                <p style={{ fontSize: 13, color: T.muted, margin: '3px 0 0' }}>
                  Fill in the details below to create a courier booking
                </p>
              </div>
            </div>
          </div>

          {/* ── API error ── */}
          {apiError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', marginBottom: 20,
              background: T.redLow, border: `1px solid ${T.redBorder}`,
              borderRadius: 10, fontSize: 13, color: T.red,
            }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── 01 Sender ── */}
            <Section title="Sender Information" icon="👤" step={1}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <Field label="Full Name *" error={errors.senderName}>
                  <input
                    id="senderName" name="senderName" type="text"
                    value={form.senderName} onChange={handleChange}
                    placeholder="John Doe"
                    style={getFocusStyle('senderName', !!errors.senderName)}
                    disabled={loading} autoComplete="off"
                    onFocus={() => setFocusedField('senderName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </Field>
                <Field label="Phone Number *" error={errors.senderPhone}>
                  <input
                    id="senderPhone" name="senderPhone" type="tel"
                    value={form.senderPhone} onChange={handleChange}
                    placeholder="+91 98765 43210"
                    style={getFocusStyle('senderPhone', !!errors.senderPhone)}
                    disabled={loading} autoComplete="off"
                    onFocus={() => setFocusedField('senderPhone')}
                    onBlur={() => setFocusedField(null)}
                  />
                </Field>
              </div>
              <Field label="Pickup Address *" error={errors.senderAddress}>
                <textarea
                  id="senderAddress" name="senderAddress" rows={3}
                  value={form.senderAddress} onChange={handleChange}
                  placeholder="Flat / Office Number, Building, Street, City, State, ZIP Code"
                  style={{ ...getFocusStyle('senderAddress', !!errors.senderAddress), resize: 'vertical' }}
                  disabled={loading}
                  onFocus={() => setFocusedField('senderAddress')}
                  onBlur={() => setFocusedField(null)}
                />
              </Field>
            </Section>

            {/* ── 02 Receiver ── */}
            <Section title="Receiver Information" icon="📍" step={2}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <Field label="Full Name *" error={errors.receiverName}>
                  <input
                    id="receiverName" name="receiverName" type="text"
                    value={form.receiverName} onChange={handleChange}
                    placeholder="Jane Doe"
                    style={getFocusStyle('receiverName', !!errors.receiverName)}
                    disabled={loading} autoComplete="off"
                    onFocus={() => setFocusedField('receiverName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </Field>
                <Field label="Phone Number *" error={errors.receiverPhone}>
                  <input
                    id="receiverPhone" name="receiverPhone" type="tel"
                    value={form.receiverPhone} onChange={handleChange}
                    placeholder="+91 98765 43210"
                    style={getFocusStyle('receiverPhone', !!errors.receiverPhone)}
                    disabled={loading} autoComplete="off"
                    onFocus={() => setFocusedField('receiverPhone')}
                    onBlur={() => setFocusedField(null)}
                  />
                </Field>
              </div>
              <Field label="Delivery Address *" error={errors.receiverAddress}>
                <textarea
                  id="receiverAddress" name="receiverAddress" rows={3}
                  value={form.receiverAddress} onChange={handleChange}
                  placeholder="Flat / House Number, Apartment / Locality, Street, City, State, ZIP Code"
                  style={{ ...getFocusStyle('receiverAddress', !!errors.receiverAddress), resize: 'vertical' }}
                  disabled={loading}
                  onFocus={() => setFocusedField('receiverAddress')}
                  onBlur={() => setFocusedField(null)}
                />
              </Field>
            </Section>

            {/* ── 03 Package Details ── */}
            <Section title="Package Details" icon="📦" step={3}>
              {/* Package type selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Package Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {PACKAGE_TYPES.map(t => {
                    const selected = form.packageType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => selectPackageType(t.id)}
                        disabled={loading}
                        style={{
                          padding: '14px 10px',
                          borderRadius: 12,
                          border: `1px solid ${selected ? T.accentBorder : T.border}`,
                          background: selected ? T.accentLow : T.subtle,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: 6,
                          transition: 'all .15s',
                          outline: selected ? `2px solid ${T.accent}22` : 'none',
                          outlineOffset: 2,
                        }}
                        onMouseEnter={e => { if (!loading && !selected) (e.currentTarget as HTMLButtonElement).style.borderColor = T.accentBorder; }}
                        onMouseLeave={e => { if (!loading && !selected) (e.currentTarget as HTMLButtonElement).style.borderColor = T.border; }}
                      >
                        <span style={{ fontSize: 22 }}>{t.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: selected ? T.accent : T.text }}>{t.id}</span>
                        <span style={{ fontSize: 10, color: T.muted, textAlign: 'center', lineHeight: 1.3 }}>{t.desc}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: selected ? T.accent : T.muted,
                          fontFamily: 'monospace',
                          marginTop: 2,
                        }}>₹{t.rate}/kg</span>
                      </button>
                    );
                  })}
                </div>
                {errors.packageType && <p style={fieldErrorStyle}><span>✕</span>{errors.packageType}</p>}
              </div>

              {/* Weight + price calculator */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16, alignItems: 'flex-start' }}>
                <Field label="Weight (kg) *" error={errors.packageWeight}>
                  <input
                    id="packageWeight" name="packageWeight"
                    type="number" step="0.1" min="0.1" max="1000"
                    value={form.packageWeight} onChange={handleChange}
                    placeholder="e.g. 2.5"
                    style={getFocusStyle('packageWeight', !!errors.packageWeight)}
                    disabled={loading}
                    onFocus={() => setFocusedField('packageWeight')}
                    onBlur={() => setFocusedField(null)}
                  />
                </Field>

                {/* Fare calculator card */}
                <div style={{
                  background: 'rgba(139,92,246,.04)',
                  border: `1px solid ${T.accentBorder}`,
                  borderRadius: 12,
                  padding: '16px 18px',
                }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
                    Live Fare Calculator
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: T.muted }}>Rate per kg</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: 'monospace' }}>
                      {form.packageType ? `₹${currentRate}` : '—'}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 10, paddingBottom: 10,
                    borderBottom: `1px solid ${T.border}`,
                  }}>
                    <span style={{ fontSize: 12, color: T.muted }}>Weight</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: 'monospace' }}>
                      {weightVal > 0 ? `${weightVal} kg` : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Total</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: T.cyan, fontFamily: 'monospace', letterSpacing: '-1px' }}>
                      {totalPrice > 0 ? `₹${totalPrice}` : '₹0'}
                    </span>
                  </div>
                </div>
              </div>
            </Section>

            {/* ── 04 Package Photo ── */}
            <Section title="Package Photo (Optional)" icon="📷" step={4}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <label style={{
                  flex: 1, minWidth: 200,
                  border: `1.5px dashed ${T.border}`,
                  borderRadius: 12, padding: '28px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'var(--surface2)',
                  transition: 'border-color .2s, background .2s',
                }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.background = T.accentLow; } }}
                  onMouseLeave={e => { if (!loading) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = 'var(--surface2)'; } }}
                >
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} disabled={loading} />
                  <span style={{ fontSize: 26 }}>📤</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Upload package image</span>
                  <span style={{ fontSize: 11, color: T.muted }}>PNG, JPG, WEBP — max 2 MB</span>
                </label>

                {packageImage && (
                  <div style={{
                    position: 'relative', width: 100, height: 100,
                    borderRadius: 12, overflow: 'hidden',
                    border: `1px solid ${T.border}`, flexShrink: 0,
                  }}>
                    <img src={packageImage} alt="Package Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button" onClick={removeImage}
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(239,68,68,.9)', border: 'none',
                        color: '#fff', fontSize: 10, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold',
                      }}
                      title="Remove Image"
                    >✕</button>
                  </div>
                )}
              </div>
              {errors.packageImage && <p style={{ ...fieldErrorStyle, marginTop: 8 }}><span>✕</span>{errors.packageImage}</p>}
            </Section>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                borderRadius: 12, border: 'none',
                background: loading ? 'rgba(139,92,246,.4)' : T.accent,
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit',
                transition: 'background .15s, transform .1s',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#7c3aed'; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = T.accent; }}
              onMouseDown={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.99)'; }}
              onMouseUp={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
                    animation: 'spin .7s linear infinite', flexShrink: 0,
                  }} />
                  Creating Booking…
                </>
              ) : (
                <>
                  Create Booking Request
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}

export default function NewBookingPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <BookingForm />
    </ProtectedRoute>
  );
}