import React, { useEffect } from 'react';
import { C } from '../utils/colors';

export default function NewsTab({ holdings, finnhubKey, newsData, loading, errors, fetchNews, retry }) {
  const [active, setActive] = React.useState(holdings[0]?.ticker || '');

  useEffect(() => {
    if (active) fetchNews(active);
  }, [active]); // eslint-disable-line

  const items = newsData[active] || [];
  const isLoading = loading[active];
  const error = errors[active];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 110px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 190, background: C.bgCard, borderRight: `1px solid ${C.border}`, overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '12px 16px', fontSize: 10, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}` }}>
          Holdings
        </div>
        {holdings.map(h => (
          <button key={h.ticker} onClick={() => setActive(h.ticker)} style={{
            width: '100%', padding: '11px 16px', textAlign: 'left',
            background: active === h.ticker ? C.bgActive : 'transparent',
            border: 'none', borderLeft: active === h.ticker ? `2px solid ${C.accent}` : '2px solid transparent',
            cursor: 'pointer', transition: 'all 0.12s',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: active === h.ticker ? C.accentBright : C.text }}>
              {h.ticker}
              {errors[h.ticker] && <span style={{ color: C.loss, marginLeft: 5, fontSize: 10 }}>✕</span>}
              {loading[h.ticker] && <span style={{ color: C.warn, marginLeft: 5, fontSize: 10 }}>⟳</span>}
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>{h.theme || h.type}</div>
          </button>
        ))}
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: C.bg }}>
        {!finnhubKey && (
          <div style={{ background: C.bgActive, border: `1px solid ${C.accent}44`, borderRadius: 10, padding: '18px 22px', marginBottom: 20 }}>
            <div style={{ color: C.accentBright, fontWeight: 700, marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>📰 Add your Finnhub API key to see real news</div>
            <div style={{ color: C.textSub, fontSize: 13, lineHeight: 1.7 }}>
              1. Go to <strong style={{ color: C.text }}>finnhub.io</strong> → Sign up free<br />
              2. Copy your API key from the dashboard<br />
              3. Click <strong style={{ color: C.text }}>⚙ Settings</strong> in the top bar and paste it there
            </div>
          </div>
        )}

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50%', gap: 14 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: C.textDim, fontSize: 12 }}>Fetching news for <span style={{ color: C.accentBright }}>{active}</span>…</div>
          </div>
        )}

        {!isLoading && error && (
          <div style={{ background: '#140808', border: `1px solid ${C.loss}44`, borderRadius: 10, padding: '18px 22px', marginBottom: 20 }}>
            <div style={{ color: C.loss, fontWeight: 700, marginBottom: 6 }}>⚠ Error loading news</div>
            <div style={{ color: C.textSub, fontSize: 12, marginBottom: 12, fontFamily: 'monospace' }}>{error}</div>
            <button onClick={() => retry(active)} style={{ background: C.bgActive, border: `1px solid ${C.loss}44`, color: C.loss, borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>↻ Retry</button>
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 19, fontWeight: 800, color: C.text }}>{active}</span>
              <span style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 6, padding: '2px 10px', fontSize: 11, color: C.textDim }}>
                {items.length} articles · last 30 days
              </span>
              <button onClick={() => retry(active)} style={{ marginLeft: 'auto', background: 'transparent', border: `1px solid ${C.border}`, color: C.textDim, borderRadius: 6, padding: '4px 12px', fontSize: 11, cursor: 'pointer' }}>↻ Refresh</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 7 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.45, fontFamily: 'DM Sans, sans-serif', flex: 1 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: C.textDim, whiteSpace: 'nowrap', fontFamily: 'DM Mono, monospace' }}>{item.date}</div>
                    </div>
                    {item.summary && (
                      <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, marginBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>
                        {item.summary.slice(0, 280)}{item.summary.length > 280 ? '…' : ''}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ background: C.bgActive, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, color: C.accentBright }}>{item.source}</span>
                      <span style={{ background: C.bgActive, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, color: C.textDim, textTransform: 'capitalize' }}>{item.category}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textFade }}>↗ Read full article</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {!isLoading && !error && items.length === 0 && finnhubKey && (
          <div style={{ color: C.textDim, textAlign: 'center', marginTop: 80, fontSize: 13 }}>
            No news found for {active} in the past 30 days.
          </div>
        )}
      </div>
    </div>
  );
}
