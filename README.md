# Portfolio Terminal — Setup & Deployment Guide

A Bloomberg-style investment tracker with live prices, real news, and persistent storage.

---

## What You Get

- **Live prices** pulled from Yahoo Finance (free, no key needed)
- **All return periods auto-calculated** — 1D, 5D, 1M, 3M, 6M, YTD, 1Y, 3Y, QTD, MTD
- **Real financial news** via Finnhub (free tier)
- **Your holdings saved** in your browser — survives page refresh
- **Add / Edit / Delete holdings** via a form

---

## Step 1 — Get a Free Finnhub API Key (5 minutes)

1. Go to [https://finnhub.io](https://finnhub.io)
2. Click **Sign up for free**
3. Verify your email
4. Log in → your API key is shown on the dashboard
5. Copy it — you'll paste it into the app later (under ⚙ Settings)

Free tier gives you 60 API calls/minute — more than enough for daily use.

---

## Step 2 — Deploy to Vercel (10 minutes, free forever)

### Option A: Deploy via GitHub (Recommended)

1. Create a free account at [github.com](https://github.com)
2. Create a **New Repository** → name it `portfolio-tracker` → make it **Private**
3. Upload all these files keeping the same folder structure
4. Go to [vercel.com](https://vercel.com) → Sign up with your GitHub account
5. Click **Add New Project** → Import your `portfolio-tracker` repo
6. Leave all settings as default → click **Deploy**
7. Vercel gives you a URL like `https://portfolio-tracker-xyz.vercel.app`
8. Bookmark that URL — that's your daily dashboard!

### Option B: Deploy via Vercel CLI

```bash
# Install Node.js from nodejs.org first, then:
npm install -g vercel
cd portfolio-tracker
npm install
vercel
# Follow the prompts — it deploys automatically
```

---

## Step 3 — First Time Setup (2 minutes)

1. Open your Vercel URL
2. You'll see demo holdings (AAPL, MSFT, NVDA, QQQ)
3. Click **⚙ Settings** → paste your Finnhub API key → Save
4. Delete the demo holdings and add your real ones:
   - Click **+ Add Holding**
   - Enter your ticker, quantity, average price, and investment date
   - Click **Add Holding**
5. Prices load automatically — all return periods are calculated instantly

---

## Daily Use

- Open your bookmark every morning
- Click **↻ Prices** to refresh to current market prices
- Switch to **News & Research** tab → click any holding → real news appears
- Holdings are auto-saved in your browser — no login needed

---

## How to Add a Holding

| Field | What to enter | Example |
|-------|--------------|---------|
| Ticker | Stock/ETF symbol | AAPL |
| Type | Stock, ETF, etc. | Stock |
| Name | Company name | Apple Inc. |
| Theme | Your own category | Technology |
| Quantity | Number of shares/units | 50 |
| Avg Price | Your average cost per share | 172.30 |
| Investment Date | When you first bought | 2023-03-15 |
| Additional Investments | Comma-separated dates if you bought more | 2023-09-10, 2024-01-15 |
| Partial Exits | Date:quantity for partial sells | 2023-06-15:10 |
| Full Exit | Date you fully exited | 2024-08-01 |

---

## Troubleshooting

**Prices not loading?**
- Yahoo Finance has rate limits. Wait 1–2 minutes and click ↻ Prices

**News not showing?**
- Check your Finnhub key is correct in ⚙ Settings
- Finnhub free tier has limits — if you hit them, wait a few minutes

**Holdings disappeared after browser clear?**
- Holdings are stored in browser localStorage. If you clear browser data they reset.
- To back up: open browser DevTools → Application → Local Storage → copy the `portfolio_holdings_v1` value

---

## File Structure

```
portfolio-tracker/
├── public/
│   └── index.html
├── src/
│   ├── App.js                    ← Main app
│   ├── index.js
│   ├── components/
│   │   ├── HoldingsTab.js        ← Holdings table
│   │   ├── NewsTab.js            ← News feed
│   │   ├── HoldingForm.js        ← Add/edit modal
│   │   └── SettingsModal.js      ← API key settings
│   ├── hooks/
│   │   ├── useMarketData.js      ← Yahoo Finance prices
│   │   └── useNews.js            ← Finnhub news
│   └── utils/
│       ├── finance.js            ← Return calculations
│       └── storage.js            ← localStorage helpers
└── package.json
```

---

## Want to Upgrade Later?

- **Indian stocks** (NSE/BSE): Use Zerodha Kite Connect API or Upstox API instead of Yahoo Finance
- **Auto-import from broker**: Export CSV from your broker → I can build an importer for it
- **Mobile app**: The same code can be wrapped in Capacitor for iOS/Android
- **Database storage**: Replace localStorage with Supabase (free) for cross-device sync

Just ask and I can build any of these additions.
