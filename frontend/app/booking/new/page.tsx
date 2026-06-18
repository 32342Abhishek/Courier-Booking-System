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

  // Payment states
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'Net Banking'>('Card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [paymentStep, setPaymentStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentStatusText, setPaymentStatusText] = useState('');

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

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowPayment(true);
      setPaymentStep('idle');
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === 'Card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        setApiError('Please fill all card details.');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setApiError('Please enter a valid UPI ID (e.g. name@okhdfcbank).');
        return;
      }
    }
    
    setPaymentStep('processing');
    setApiError('');
    
    const steps = [
      'Initiating secure gateway connection...',
      'Verifying payment credentials...',
      'Authorizing transaction with bank...',
      'Payment successful! Finalizing booking...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setPaymentStatusText(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setPaymentStep('success');
    await new Promise(resolve => setTimeout(resolve, 600));

    setLoading(true);
    const txnId = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
    try {
      await bookingsAPI.create({
        ...form,
        packageWeight: parseFloat(form.packageWeight),
        packageImage,
        calculatedPrice: totalPrice,
        paymentStatus: 'Paid',
        paymentMethod,
        paymentTransactionId: txnId
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      setPaymentStep('idle');
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
        @keyframes scaleIn { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
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

          <form onSubmit={handleProceedToPayment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

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
                  Proceed to Payment & Booking
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

          </form>
        </div>
      </div>

      {/* ── Payment Overlay Modal ── */}
      {showPayment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          fontFamily: "'Inter', sans-serif"
        }} onClick={() => paymentStep === 'idle' && setShowPayment(false)}>
          <div style={{
            width: '100%',
            maxWidth: 480,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: 30,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            position: 'relative',
            animation: 'scaleIn 0.2s ease',
            color: T.text
          }} onClick={e => e.stopPropagation()}>
            
            {/* Close Button */}
            {paymentStep === 'idle' && (
              <button 
                type="button"
                onClick={() => setShowPayment(false)}
                style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'none', border: 'none', color: T.muted,
                  cursor: 'pointer', fontSize: 18
                }}
              >✕</button>
            )}

            {paymentStep === 'idle' && (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Confirm Shipment Payment</h3>
                <p style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>Select your payment method and complete checkout</p>
                
                {/* Summary Box */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: T.muted }}>Package Type</span>
                    <span style={{ fontWeight: 600 }}>{form.packageType}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: T.muted }}>Weight</span>
                    <span style={{ fontWeight: 600 }}>{form.packageWeight} kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: T.muted }}>Receiver</span>
                    <span style={{ fontWeight: 600 }}>{form.receiverName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${T.border}`, paddingTop: 10, marginTop: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Amount to Pay</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: T.cyan, fontFamily: 'monospace' }}>₹{totalPrice}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{
                  display: 'flex', gap: 6,
                  background: T.subtle, border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: 4, marginBottom: 20
                }}>
                  {(['Card', 'UPI', 'Net Banking'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 8,
                        fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: paymentMethod === method ? T.surface : 'transparent',
                        color: paymentMethod === method ? T.text : T.muted,
                        transition: 'all 0.15s'
                      }}
                    >
                      {method === 'Card' ? '💳 Card' : method === 'UPI' ? '📱 UPI' : '🏦 Net'}
                    </button>
                  ))}
                </div>

                {/* Form Fields based on paymentMethod */}
                <div style={{ marginBottom: 24, minHeight: 140 }}>
                  {paymentMethod === 'Card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                          style={inputStyle()}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Card Number</label>
                        <input
                          type="text"
                          placeholder="•••• •••• •••• ••••"
                          value={cardNumber}
                          onChange={e => {
                            const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                            if (val.length <= 19) setCardNumber(val);
                          }}
                          style={inputStyle()}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={labelStyle}>Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={e => {
                              let val = e.target.value;
                              if (val.length === 2 && !val.includes('/')) val += '/';
                              if (val.length <= 5) setCardExpiry(val);
                            }}
                            style={inputStyle()}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            value={cardCvv}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length <= 3) setCardCvv(val);
                            }}
                            style={inputStyle()}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'UPI' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: '100%' }}>
                        <label style={labelStyle}>UPI ID (VPA)</label>
                        <input
                          type="text"
                          placeholder="username@bank"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          style={inputStyle()}
                        />
                      </div>
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 8, padding: 16, border: `1px solid ${T.border}`, borderRadius: 12,
                        background: 'rgba(255,255,255,0.01)', width: '100%'
                      }}>
                        <div style={{
                          background: '#fff', padding: 8, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=swiftship@bank%26pn=SwiftShip%26am=${totalPrice}%26cu=INR`} 
                            alt="Mock UPI QR Code" 
                            style={{ width: 100, height: 100 }}
                          />
                        </div>
                        <span style={{ fontSize: 11, color: T.muted }}>Scan mock QR with any UPI app to pay</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'Net Banking' && (
                    <div>
                      <label style={labelStyle}>Select Bank</label>
                      <select 
                        value={selectedBank} 
                        onChange={e => setSelectedBank(e.target.value)}
                        style={inputStyle()}
                      >
                        <option value="SBI">State Bank of India (SBI)</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="Axis">Axis Bank</option>
                        <option value="KOTAK">Kotak Mahindra Bank</option>
                      </select>
                      <p style={{ fontSize: 11, color: T.muted, marginTop: 12, lineHeight: 1.5 }}>
                        You will be redirected to a simulated secure bank portal to complete the payment.
                      </p>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {apiError && (
                  <div style={{
                    fontSize: 12, color: T.red, marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <span>✕</span> {apiError}
                  </div>
                )}

                {/* Pay Button */}
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    background: T.accent, color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, fontFamily: 'inherit', transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#7c3aed')}
                  onMouseLeave={e => (e.currentTarget.style.background = T.accent)}
                >
                  Pay ₹{totalPrice} & Book
                </button>
              </>
            )}

            {paymentStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  border: '3px solid rgba(139,92,246,0.15)', borderTopColor: '#8b5cf6',
                  animation: 'spin .8s linear infinite', margin: '0 auto 24px'
                }} />
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Processing Payment</h4>
                <p style={{ fontSize: 12, color: T.muted, fontFamily: 'monospace' }}>{paymentStatusText}</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: T.green, margin: '0 auto 20px',
                  animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>✓</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: T.green }}>Payment Successful!</h4>
                <p style={{ fontSize: 12, color: T.muted }}>Redirecting to dashboard...</p>
              </div>
            )}

          </div>
        </div>
      )}
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