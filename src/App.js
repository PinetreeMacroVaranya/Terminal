import React, { useState, useEffect } from 'react';
import HoldingsTab from './components/HoldingsTab';
import NewsTab from './components/NewsTab';
import HoldingForm from './components/HoldingForm';
import SettingsModal from './components/SettingsModal';
import { loadHoldings, saveHoldings, loadFinnhubKey, saveFinnhubKey } from './utils/storage';
import { useMarketData } from './hooks/useMarketData';
import { useNews } from './hooks/useNews';
import { holdingValue, holdingCost } from './utils/finance';
import { C } from './utils/colors';

const DEMO_HOLDINGS = [
  { id: 1, ticker: 'AAPL', name: 'Apple Inc.', type: 'Stock', quantity: 50, avgPrice: 172.30, dateOfInvestment: '2023-03-15', additionalInvestments: ['2023-09-10'], partialExits: [], fullExit: null, theme: 'Technology' },
  { id: 2, ticker: 'MSFT', name: 'Microsoft Corp.', type: 'Stock', quantity: 30, avgPrice: 310.50, dateOfInvestment: '2022-11-20', additionalInvestments: [], partialExits: [{ date: '2023-06-15', qty: 10 }], fullExit: null, theme: 'Technology' },
  { id: 3, ticker: 'NVDA', name: 'NVIDIA Corp.', type: 'Stock', quantity: 25, avgPrice: 450.00, dateOfInvestment: '2023-01-05', additionalInvestments: ['2023-05-20'], partialExits: [], fullExit: null, theme: 'AI / Semiconductors' },
  { id: 4, ticker: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', quantity: 40, avgPrice: 375.20, dateOfInvestment: '2022-06-01', additionalInvestments: [], partialExits: [], fullExit: null, theme: 'Technology' },
];

export default function App() {
  const [holdings, setHoldings] = useState(() => {
    const saved = loadHoldings();
    return saved.length > 0 ? saved : DEMO_HOLDINGS;
  });
  const [tab, setTab] = useState('holdings');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [finnhubKey, setFinnhubKey] = useState(loadFinnhubKey);

  const { prices, loading: priceLoading, lastUpdated, errors: priceErrors, refresh } = useMarketData(holdings);
  const { newsData, loading: newsLoading, errors: newsErrors, fetchNews, retry: retryNews } = useNews(finnhubKey);

  useEffect(() => { saveHoldings(holdings); }, [holdings]);

  const handleSaveFinnhub = (key) => { setFinnhubKey(key); saveFinnhubKey(key); };

  const addOrUpdateHolding = (h) => {
    setHoldings(prev => {
      const idx = prev.findIndex(p => p.id === h.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = h; return n; }
      return [...prev, h];
    });
    setShowForm(false);
    setEditTarget(null);
  };

  const deleteHolding = (id) => setHoldings(prev => prev.filter(h => h.id !== id));

  const enriched = holdings.map(h => ({ ...h, currentPrice: prices[h.ticker]?.currentPrice || null }));
  const total = enriched.reduce((s, h) => s + (h.currentPrice ? holdingValue(h) : holdingCost(h)), 0);
  const totalCost = enriched.reduce((s, h) => s + holdingCost(h), 0);
  const totalGain = total - totalCost;
  const totalGainPct = totalCost ? (totalGain / totalCost) * 100 : 0;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'DM Mono, monospace', color: C.text }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } button:active { opacity: 0.8; }`}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.bgCard, borderBottom: `1px solid ${C.border}`, padding: '0 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '13px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accentBright, letterSpacing: '0.1em' }}>◈ PINETREE MACRO</div>
          <div style={{ width: 1, height: 22, background: C.border }} />
          <div style={{ fontSize: 12, color: C.textDim }}>NAV <span style={{ color: C.text, fontWeight: 700 }}>${total.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></div>
          <div style={{ fontSize: 12 }}>P&L <span style={{ color: totalGain >= 0 ? C.gain : C.loss, fontWeight: 700 }}>{totalGain >= 0 ? '+' : ''}${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 0 })} ({totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(2)}%)</span></div>
          <div style={{ fontSize: 11, color: C.textFade }}>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : priceLoading ? '⟳ Loading…' : ''}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 2, marginRight: 8 }}>
            {[['holdings', 'Holdings'], ['news', 'News & Research']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: '6px 16px', fontSize: 12, fontWeight: 600, background: tab === k ? C.bgActive : 'transparent', border: 'none', borderBottom: tab === k ? `2px solid ${C.accent}` : '2px solid transparent', color: tab === k ? C.accentBright : C.textDim, cursor: 'pointer', transition: 'all 0.12s', letterSpacing: '0.05em' }}>{l}</button>
            ))}
          </div>
          <button onClick={refresh} style={{ background: C.bgActive, border: `1px solid ${C.border}`, color: C.textSub, borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>{priceLoading ? '⟳' : '↻'} Prices</button>
          <button onClick={() => setShowSettings(true)} style={{ background: C.bgActive, border: `1px solid ${C.border}`, color: C.textSub, borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>⚙ Settings</button>
        </div>
      </div>

      {tab === 'holdings' && <HoldingsTab holdings={holdings} prices={prices} priceLoading={priceLoading} priceErrors={priceErrors} onAdd={() => { setEditTarget(null); setShowForm(true); }} onEdit={(h) => { setEditTarget(h); setShowForm(true); }} onDelete={deleteHolding} />}
      {tab === 'news' && holdings.length > 0 && <NewsTab holdings={holdings} finnhubKey={finnhubKey} newsData={newsData} loading={newsLoading} errors={newsErrors} fetchNews={fetchNews} retry={retryNews} />}
      {tab === 'news' && holdings.length === 0 && <div style={{ textAlign: 'center', marginTop: 80, color: C.textDim, fontSize: 13 }}>Add holdings first to see news.</div>}

      {showForm && <HoldingForm existing={editTarget} onSave={addOrUpdateHolding} onCancel={() => { setShowForm(false); setEditTarget(null); }} />}
      {showSettings && <SettingsModal finnhubKey={finnhubKey} onSave={handleSaveFinnhub} onClose={() => setShowSettings(false)} />}
    </div>
  );
}
