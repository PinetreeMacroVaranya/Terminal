// Given a sorted array of {date, close} objects (newest first) and avgPrice,
// compute all return periods.

export function calcReturns(history, currentPrice, avgPrice) {
  if (!history || history.length === 0 || !currentPrice) return null;

  const now = currentPrice;

  // history[0] = today/latest, history[1] = previous trading day
  // For daily return: use previous close (history[1]) vs current price
  const prevClose = history[1]?.close || null;

  // For N-day lookback: skip today's entry (index 0) and find closest to target date
  const get = (daysAgo) => {
    const target = new Date();
    target.setDate(target.getDate() - daysAgo);
    target.setHours(0, 0, 0, 0);
    const targetTs = target.getTime();
    // Only look at history beyond index 0 (skip today)
    const past = history.slice(1);
    if (past.length === 0) return null;
    const sorted = [...past].sort((a, b) =>
      Math.abs(new Date(a.date).getTime() - targetTs) -
      Math.abs(new Date(b.date).getTime() - targetTs)
    );
    return sorted[0]?.close || null;
  };

  const pct = (past) => (past && past !== now) ? +((( now - past) / past) * 100).toFixed(2) : null;

  // Period start helpers — find first trading day on or after a calendar date
  const startOf = (unit) => {
    const d = new Date();
    if (unit === 'year')    { d.setMonth(0); d.setDate(1); }
    if (unit === 'quarter') { const q = Math.floor(d.getMonth() / 3); d.setMonth(q * 3); d.setDate(1); }
    if (unit === 'month')   { d.setDate(1); }
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getPriceAtDate = (date) => {
    const ts = date.getTime();
    const past = history.slice(1);
    if (past.length === 0) return null;
    const sorted = [...past].sort((a, b) =>
      Math.abs(new Date(a.date).getTime() - ts) -
      Math.abs(new Date(b.date).getTime() - ts)
    );
    return sorted[0]?.close || null;
  };

  return {
    daily:       pct(prevClose),
    fiveDay:     pct(get(5)),
    oneMonth:    pct(get(30)),
    threeMonth:  pct(get(90)),
    sixMonth:    pct(get(180)),
    oneYear:     pct(get(365)),
    threeYear:   pct(get(1095)),
    ytd:         pct(getPriceAtDate(startOf('year'))),
    qtd:         pct(getPriceAtDate(startOf('quarter'))),
    mtd:         pct(getPriceAtDate(startOf('month'))),
    grossReturn: avgPrice ? +((( now - avgPrice) / avgPrice) * 100).toFixed(2) : null,
    netReturn:   avgPrice ? +(((now - avgPrice) / avgPrice) * 100 - 0.5).toFixed(2) : null,
  };
}

export function portfolioTotal(holdings) {
  return holdings.reduce((s, h) => s + (h.currentPrice || 0) * h.quantity, 0);
}

export function holdingValue(h) {
  return (h.currentPrice || 0) * h.quantity;
}

export function holdingCost(h) {
  return h.avgPrice * h.quantity;
}
