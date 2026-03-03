const HOLDINGS_KEY = 'portfolio_holdings_v1';
const API_KEY_KEY = 'portfolio_finnhub_key';

export function loadHoldings() {
  try {
    const raw = localStorage.getItem(HOLDINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveHoldings(holdings) {
  try { localStorage.setItem(HOLDINGS_KEY, JSON.stringify(holdings)); } catch {}
}

export function loadFinnhubKey() {
  return localStorage.getItem(API_KEY_KEY) || '';
}

export function saveFinnhubKey(key) {
  localStorage.setItem(API_KEY_KEY, key);
}
