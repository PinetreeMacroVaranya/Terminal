import React, { useState } from 'react';
import { holdingValue, holdingCost } from '../utils/finance';
import { C } from '../utils/colors';

const RETURN_COLS = [
  { key: 'daily', label: '1D' }, { key: 'fiveDay', label: '5D' },
  { key: 'oneMonth', label: '1M' }, { key: 'threeMonth', label: '3M' },
  { key: 'sixMonth', label: '6M' }, { key: 'ytd', label: 'YTD' },
  { key: 'oneYear', label: '1Y' }, { key: 'threeYear', label: '3Y' },
  { key: 'qtd', label: 'QTD' }, { key: 'mtd', label: 'MTD' },
];

function Pct({ v }) {
  if (v == null) return <span style={{ color: C.textFade }}>—</span>;
  const color = v > 0 ? C.gain : v < 0 ? C.loss : C.textSub;
  return <span style={{ color, fontWeight: 600 }}>{v > 0 ? '+' : ''}{v.toFixed(2)}%</span>;
}

function Curr({ v }) {
  if (v == null) return <span style={{ color: C.textFade }}>—</span>;
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const thStyle = (active) => ({
  padding: '8px 10px', fontSize: 11, fontWeight: 600,
  color: active ? C.accentBright : C.textDim,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  whiteSpace: 'nowrap', textAlign: 'right',
  userSelect: 'none', cursor: 'pointer',
  background: active ? C.bgActive : 'transparent',
  borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
});

const tdStyle = (extra = {}) => ({
  padding: '10px 10px', textAlign: 'right', fontSize: 12,
  whiteSpace: 'nowrap', ...extra,
});

export default function HoldingsTab({ holdings, prices, priceLoading, priceErrors, onAdd, onEdit, onDelete }) {
  const [sortKey, setSortKey] = useState('ticker');
  const [sortDir, setSortDir] = useState(1);

  const handleSort = (k) => {
    if (sortKey === k) setSortDir(d => -d);
    else { setSortKey(k); setSortDir(-1); }
  };

  const enriched = holdings.map(h => ({
    ...h,
    currentPrice: prices[h.ticker]?.currentPrice || null,
    returns: prices[h.ticker]?.returns || null,
    priceError: priceErrors[h.ticker] || null,
  }));

  const total = enriched.reduce((s, h) => s + (h.currentPrice ? holdingValue(h) : holdingCost(h)), 0);
  const totalCost = enriched.reduce((s, h) => s + holdingCost(h), 0);
  const totalGain = total - totalCost;
  const totalGainPct = totalCost ? (totalGain / totalCost) * 100 : 0;

  const sorted = [...enriched].sort((a, b) => {
    let av, bv;
    const returnKeys = ['daily','fiveDay','oneMonth','threeMonth','sixMonth','ytd','oneYear','threeYear','qtd','mtd','grossReturn','netReturn'];
    if (returnKeys.includes(sortKey)) {
      av = a.returns?.[sortKey] ?? -9999;
      bv = b.returns?.[sortKey] ?? -9999;
    } else {
      av = a[sortKey] ?? 0; bv = b[sortKey] ?? 0;
    }
    return typeof av === 'string' ? av.localeCompare(bv) * sortDir : (av - bv) * sortDir;
  });

  const SortTH = ({ k, label }) => (
    <th onClick={() => handleSort(k)} style={thStyle(sortKey === k)}>
      {label}{sortKey === k ? (sortDir === 1 ? ' ↑' : ' ↓') : ''}
    </th>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${C.borderDim}` }}>
        <div style={{ fontSize: 12, color: C.textDim }}>
          {priceLoading
            ? <span style={{ color: C.warn }}>⟳ Fetching live prices…</span>
            : <span>{holdings.length} positions · Live prices loaded</span>}
        </div>
        <button onClick={onAdd} style={{
          background: C.accent, border: 'none', color: '#fff',
          borderRadius: 7, padding: '7px 18px', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
        }}>+ Add Holding</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: C.bgCard, borderBottom: `1px solid ${C.border}` }}>
            <SortTH k="ticker" label="Ticker" />
            <th style={{ ...thStyle(false), textAlign: 'left' }}>Name</th>
            <SortTH k="type" label="Type" />
            <SortTH k="quantity" label="Qty" />
            <SortTH k="avgPrice" label="Avg Price" />
            <SortTH k="currentPrice" label="LTP" />
            <SortTH k="grossReturn" label="Gross%" />
            <SortTH k="netReturn" label="Net%" />
            {RETURN_COLS.map(c => <SortTH key={c.key} k={c.key} label={c.label} />)}
            <th style={thStyle(false)}>Wt%</th>
            <th style={thStyle(false)}>Mkt Val</th>
            <th style={thStyle(false)}>Inv. Date</th>
            <th style={thStyle(false)}>Addl. Inv.</th>
            <th style={thStyle(false)}>Part. Exit</th>
            <th style={thStyle(false)}>Full Exit</th>
            <th style={thStyle(false)}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((h, i) => {
            const mv = h.currentPrice ? holdingValue(h) : holdingCost(h);
            const w = total ? ((mv / total) * 100).toFixed(1) : '—';
            const bg = i % 2 === 0 ? C.bg : C.bgAlt;
            return (
              <tr key={h.id} style={{ borderBottom: `1px solid ${C.borderDim}` }}
                onMouseEnter={e => [...e.currentTarget.cells].forEach(c => c.style.background = C.bgHover)}
                onMouseLeave={e => [...e.currentTarget.cells].forEach(c => c.style.background = bg)}
              >
                <td style={tdStyle({ background: bg, fontWeight: 800, color: C.accentBright })}>{h.ticker}</td>
                <td style={tdStyle({ background: bg, textAlign: 'left', color: C.textSub, fontFamily: 'DM Sans, sans-serif', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' })}>
                  {h.priceError ? <span title={h.priceError} style={{ color: C.loss, fontSize: 10 }}>⚠ {h.name}</span> : h.name}
                </td>
                <td style={tdStyle({ background: bg })}>
                  <span style={{
                    background: h.type === 'ETF' ? '#0a2040' : '#140a28',
                    color: h.type === 'ETF' ? C.accentBright : '#a78bfa',
                    borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700,
                  }}>{h.type}</span>
                </td>
                <td style={tdStyle({ background: bg, color: C.text })}>{h.quantity.toLocaleString()}</td>
                <td style={tdStyle({ background: bg, color: C.textSub })}><Curr v={h.avgPrice} /></td>
                <td style={tdStyle({ background: bg, color: C.text, fontWeight: 700 })}>
                  {h.currentPrice ? <Curr v={h.currentPrice} /> : <span style={{ color: C.textDim }}>Loading…</span>}
                </td>
                <td style={tdStyle({ background: bg })}><Pct v={h.returns?.grossReturn} /></td>
                <td style={tdStyle({ background: bg })}><Pct v={h.returns?.netReturn} /></td>
                {RETURN_COLS.map(c => (
                  <td key={c.key} style={tdStyle({ background: bg })}><Pct v={h.returns?.[c.key]} /></td>
                ))}
                <td style={tdStyle({ background: bg, color: C.text, fontWeight: 700 })}>{w}%</td>
                <td style={tdStyle({ background: bg, color: C.text })}><Curr v={mv} /></td>
                <td style={tdStyle({ background: bg, color: C.textDim, fontSize: 11 })}>{h.dateOfInvestment}</td>
                <td style={tdStyle({ background: bg, color: C.textDim, fontSize: 11 })}>
                  {h.additionalInvestments?.length > 0 ? h.additionalInvestments.join(', ') : <span style={{ color: C.textFade }}>—</span>}
                </td>
                <td style={tdStyle({ background: bg, color: C.warn, fontSize: 11 })}>
                  {h.partialExits?.length > 0 ? h.partialExits.map(e => `${e.date}(${e.qty})`).join(', ') : <span style={{ color: C.textFade }}>—</span>}
                </td>
                <td style={tdStyle({ background: bg, color: C.loss, fontSize: 11 })}>
                  {h.fullExit ?? <span style={{ color: C.textFade }}>—</span>}
                </td>
                <td style={tdStyle({ background: bg })}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => onEdit(h)} style={{ background: C.bgActive, border: `1px solid ${C.border}`, color: C.textSub, borderRadius: 5, padding: '3px 9px', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => window.confirm(`Remove ${h.ticker}?`) && onDelete(h.id)} style={{ background: '#1a0808', border: `1px solid ${C.loss}44`, color: C.loss, borderRadius: 5, padding: '3px 9px', fontSize: 11, cursor: 'pointer' }}>✕</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: `2px solid ${C.border}`, background: C.bgCard }}>
            <td colSpan={3} style={tdStyle({ textAlign: 'left', color: C.textDim, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' })}>Portfolio Total</td>
            <td style={tdStyle({ color: C.text, fontWeight: 700 })}>{holdings.reduce((s, h) => s + h.quantity, 0).toLocaleString()}</td>
            <td colSpan={2} />
            <td style={tdStyle()}><Pct v={+totalGainPct.toFixed(2)} /></td>
            <td colSpan={11} />
            <td style={tdStyle({ color: C.text, fontWeight: 800 })}>100%</td>
            <td style={tdStyle({ color: C.text, fontWeight: 800 })}><Curr v={total} /></td>
            <td colSpan={5} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
