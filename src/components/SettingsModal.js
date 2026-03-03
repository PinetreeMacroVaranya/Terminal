import React, { useState } from 'react';
import { C } from '../utils/colors';

export default function SettingsModal({ finnhubKey, onSave, onClose }) {
  const [key, setKey] = useState(finnhubKey);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '32px 36px', width: 460, maxWidth: '95vw', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>⚙ Settings</div>
        <div style={{ fontSize: 13, color: C.textSub, marginBottom: 24, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
          Add your Finnhub API key to enable real financial news.<br />
          Get a free key at <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" style={{ color: C.accentBright }}>finnhub.io</a> → Sign up → Dashboard.
        </div>

        <label style={{ display: 'block', fontSize: 11, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Finnhub API Key</label>
        <input value={key} onChange={e => setKey(e.target.value)} placeholder="Paste your API key here"
          style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '10px 12px', color: C.text, fontSize: 13, fontFamily: 'DM Mono, monospace', outline: 'none', marginBottom: 16 }}
          onFocus={e => e.target.style.borderColor = C.accent}
          onBlur={e => e.target.style.borderColor = C.border} />

        <div style={{ background: C.bgActive, borderRadius: 8, padding: '12px 14px', marginBottom: 22, fontSize: 12, color: C.textDim, lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>
          🔒 Your API key is stored only in <strong style={{ color: C.textSub }}>your browser's local storage</strong> — it never leaves your device.
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: 7, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSub, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
          <button onClick={() => { onSave(key.trim()); onClose(); }} style={{ padding: '9px 22px', borderRadius: 7, border: 'none', background: C.accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Save Key</button>
        </div>
      </div>
    </div>
  );
}
