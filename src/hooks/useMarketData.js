import { useState, useEffect, useCallback } from 'react';
import { calcReturns } from '../utils/finance';

// Proxies tried in order — fastest/most reliable first
const PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchWithProxy(url, proxyFn) {
  const res = await fetch(proxyFn(url), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const json = JSON.parse(text);
  // allorigins wraps response in {contents:...}
  return json.contents ? JSON.parse(json.contents) : json;
}

async function fetchTicker(ticker, avgPrice) {
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - 365 * 3 * 24 * 3600;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&period1=${period1}&period2=${period2}&includePrePost=false`;

  let lastError;
  for (const proxyFn of PROXIES) {
    try {
      const data = await fetchWithProxy(url, proxyFn);
      const result = data?.chart?.result?.[0];
      if (!result) throw new Error('No data');

      const timestamps = result.timestamp || [];
      const closes = result.indicators?.quote?.[0]?.close || [];
      const currentPrice = result.meta?.regularMarketPrice || closes[closes.length - 1];
      if (!currentPrice) throw new Error('No price');

      const history = timestamps
        .map((ts, i) => ({ date: new Date(ts * 1000).toISOString().slice(0, 10), close: closes[i] }))
        .filter(d => d.close != null)
        .reverse();

      const returns = calcReturns(history, currentPrice, avgPrice);
      return { currentPrice, returns };
    } catch (e) {
      lastError = e;
    }
  }
  throw new Error(lastError?.message || 'All proxies failed');
}

export function useMarketData(holdings) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errors, setErrors] = useState({});

  const refresh = useCallback(async () => {
    if (!holdings || holdings.length === 0) return;
    setLoading(true);
    const newErrors = {};

    // Fetch ALL tickers in parallel for speed
    await Promise.all(
      holdings.map(async (h) => {
        try {
          const result = await fetchTicker(h.ticker, h.avgPrice);
          // Update each ticker as it arrives so UI fills in progressively
          setPrices(prev => ({ ...prev, [h.ticker]: result }));
        } catch (e) {
          newErrors[h.ticker] = e.message;
        }
      })
    );

    setErrors(newErrors);
    setLastUpdated(new Date());
    setLoading(false);
  }, [holdings]);

  useEffect(() => { refresh(); }, [refresh]);

  return { prices, loading, lastUpdated, errors, refresh };
}
