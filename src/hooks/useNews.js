import { useState, useRef } from 'react';

// Finnhub free tier: https://finnhub.io — get a free API key at finnhub.io/register
// 60 API calls/minute on free tier

const ONE_MONTH_AGO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
};

const TODAY = () => new Date().toISOString().slice(0, 10);

export function useNews(finnhubKey) {
  const [newsData, setNewsData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const fetchedRef = useRef(new Set());

  const fetchNews = async (ticker) => {
    if (!finnhubKey) {
      setErrors(prev => ({ ...prev, [ticker]: 'No Finnhub API key set. Click ⚙ Settings to add one.' }));
      return;
    }
    if (fetchedRef.current.has(ticker)) return;
    fetchedRef.current.add(ticker);

    setLoading(prev => ({ ...prev, [ticker]: true }));
    setErrors(prev => ({ ...prev, [ticker]: null }));

    try {
      const from = ONE_MONTH_AGO();
      const to = TODAY();
      const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(ticker)}&from=${from}&to=${to}&token=${finnhubKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Finnhub error ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error('Invalid response from Finnhub');

      // Sort newest first, keep top 20
      const sorted = data
        .filter(n => n.headline && n.datetime)
        .sort((a, b) => b.datetime - a.datetime)
        .slice(0, 20)
        .map(n => ({
          date: new Date(n.datetime * 1000).toISOString().slice(0, 10),
          title: n.headline,
          source: n.source,
          summary: n.summary || '',
          url: n.url,
          image: n.image || null,
          category: n.category || 'general',
        }));

      setNewsData(prev => ({ ...prev, [ticker]: sorted }));
    } catch (e) {
      fetchedRef.current.delete(ticker);
      setErrors(prev => ({ ...prev, [ticker]: e.message }));
    }

    setLoading(prev => ({ ...prev, [ticker]: false }));
  };

  const retry = (ticker) => {
    fetchedRef.current.delete(ticker);
    setNewsData(prev => { const n = { ...prev }; delete n[ticker]; return n; });
    setErrors(prev => { const n = { ...prev }; delete n[ticker]; return n; });
    fetchNews(ticker);
  };

  return { newsData, loading, errors, fetchNews, retry };
}
