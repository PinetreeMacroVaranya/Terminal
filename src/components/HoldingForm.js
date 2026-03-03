import React, { useState } from 'react';
import { C } from '../utils/colors';

const EMPTY = {
  ticker: '', name: '', type: 'Stock',
  quantity: '', avgPrice: '',
  dateOfInvestment: '',
  additionalInvestments: '',
  partialExits: '',
  fullExit: '',
  theme: '',
};

export default function HoldingForm({ existing, onSave, onCancel }) {
  const [form, setForm] = useState(existing ? {
    ...existing,
    additionalInvestments: existing.additionalInvestments?.join(', ') || '',
    partialExits: existing.partialExits?.map(e => `${e.date}:${e.qty}`).join(', ') || '',
    fullExit: existing.fullExit || '',
  } : EMPTY);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    width: '100%', background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 7, padding: '9px 12px', color: C.text,
    fontSize: 13, fontFamily: 'DM Mono, monospace', outline: 'none',
  };

  const handleSubmit = () => {
    if (!form.ticker || !form.quantity || !form.avgPrice || !form.dateOfInvestment) {
      alert('Ticker, Quantity, Avg Price and Investment Date are required.');
      return;
    }
    onSave({
      id: existing?.id || Date.now(),
      ticker: form.ticker.toUpperCase().trim(),
      name: form.name.trim() || form.ticker.toUpperCase().trim(),
      type: form.type,
      quantity: parseFloat(form.quantity),
      avgPrice: parseFloat(form.avgPrice),
      dateOfInvestment: form.dateOfInvestment,
      theme: form.theme.trim(),
      additionalInvestments: form.additionalInvestments
        ? form.additionalInvestments.split(',').map(s => s.trim()).filter(Boolean) : [],
      partialExits: form.partialExits
        ? form.partialExits.split(',').map(s => {
            const [date, qty] = s.trim().split(':');
            return { date: date?.trim(), qty: parseFloat(qty) || 0 };
          }).filter(e => e.date) : [],
      fullExit: form.fullExit.trim() || null,
    });
  };

  const Field = ({ label, k, type = 'text', placeholder, span, hint }) => (
    <div style={span ? { gridColumn: '1 / -1' } : {}}>
      <label style={{ display: 'block', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{label}</label>
      <input style={inputStyle} type={type} value={form[k]} placeholder={placeholder} onChange={set(k)}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border} />
      {hint && <div style={{ fontSize: 11, color: C.textFade, marginTop: 4 }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '32px 36px', width: 520, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 24, fontFamily: 'DM Sans, sans-serif' }}>
          {existing ? '✎ Edit Holding' : '+ Add Holding'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <Field label="Ticker *" k="ticker" placeholder="AAPL" />
          <div>
            <label style={{ display: 'block', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Type</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={set('type')}>
              <option>Stock</option><option>ETF</option><option>MutualFund</option><option>Bond</option><option>Crypto</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <Field label="Name / Description" k="name" placeholder="Apple Inc." />
          <Field label="Theme / Sector" k="theme" placeholder="Technology" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <Field label="Quantity *" k="quantity" type="number" placeholder="100" />
          <Field label="Avg Price Paid *" k="avgPrice" type="number" placeholder="172.30" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <Field label="Initial Investment Date *" k="dateOfInvestment" type="date" />
          <Field label="Full Exit Date" k="fullExit" type="date" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <Field label="Additional Investment Dates" k="additionalInvestments" placeholder="2023-09-10, 2024-01-15" hint="Format: YYYY-MM-DD, YYYY-MM-DD" span />
        </div>
        <div style={{ marginBottom: 14 }}>
          <Field label="Partial Exits" k="partialExits" placeholder="2023-06-15:10, 2024-03-01:25" hint="Format: YYYY-MM-DD:quantity" span />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '9px 22px', borderRadius: 7, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
          <button onClick={handleSubmit} style={{ padding: '9px 22px', borderRadius: 7, border: 'none', background: C.accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {existing ? 'Save Changes' : 'Add Holding'}
          </button>
        </div>
      </div>
    </div>
  );
}
