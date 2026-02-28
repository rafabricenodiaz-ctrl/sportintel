# ⚡ Sports Intel

A personal sports analytics dashboard — live odds, value bets, soccer fixtures, and NBA data. Built with Next.js, deployable on Vercel in minutes.

![Sports Intel Dashboard](https://via.placeholder.com/1200x630/080b12/00e5a0?text=Sports+Intel)

## Features

- **Value Bets** — automatically identifies edges across all bookmakers
- **Live Odds** — searchable, filterable odds comparison for every tracked event  
- **Soccer Fixtures** — upcoming matches + injury reports for 8 leagues
- **NBA Teams** — full team directory with conference/division filters
- **Dark dashboard UI** — clean, data-forward design

## APIs Used (all free tiers)

| API | Purpose | Free Tier |
|-----|---------|-----------|
| [The Odds API](https://the-odds-api.com) | Odds + value bets | 500 req/month |
| [API-Football](https://www.api-football.com) | Soccer fixtures + injuries | 100 req/day |
| [BallDontLie](https://www.balldontlie.io) | NBA team data | Free |

---

## Quick Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sports-intel.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Vercel auto-detects Next.js — click **Deploy**
4. After deploy: **Project → Settings → Environment Variables**

Add these variables:

```
ODDS_API_KEY         = your_key    ← REQUIRED
FOOTBALL_API_KEY     = your_key    ← optional
FOOTBALL_MODE        = apisports   ← or "rapidapi"
BALLDONTLIE_API_KEY  = your_key    ← optional
REGIONS              = us
MARKETS              = h2h
ODDS_FORMAT          = american
DAYS_AHEAD           = 2
MIN_VALUE_EDGE       = 0.02
MAX_EVENTS_PER_SPORT = 50
```

5. **Redeploy** (Deployments tab → ⋯ → Redeploy) after adding env vars.

---

## Local Development

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/sports-intel.git
cd sports-intel

# Install
npm install

# Set up env
cp .env.example .env.local
# Edit .env.local and add your API keys

# Run
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
sports-intel/
├── app/
│   ├── api/
│   │   ├── odds/route.js      ← The Odds API proxy
│   │   ├── soccer/route.js    ← API-Football proxy
│   │   └── nba/route.js       ← BallDontLie proxy
│   ├── page.js                ← Dashboard
│   ├── bets/page.js           ← Value Bets
│   ├── odds/page.js           ← Live Odds
│   ├── fixtures/page.js       ← Soccer Fixtures
│   ├── nba/page.js            ← NBA Teams
│   ├── settings/page.js       ← Setup guide
│   ├── layout.js
│   └── globals.css
├── components/
│   ├── Shell.js               ← App layout + sidebar
│   ├── Sidebar.js             ← Navigation
│   └── UI.js                  ← Shared components
├── lib/
│   └── api.js                 ← Shared helpers + edge calculation
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Edge Calculation

```
implied_prob(price)  = 100 / (price + 100)       if price > 0
                     = |price| / (|price| + 100)  if price < 0

avg_implied  = average implied probability across all books for that outcome
best_implied = implied probability at the best (highest payout) price
edge         = avg_implied - best_implied
```

Positive edge = you're paying less (in probability terms) than the market average = value bet.

---

## License

Personal use. API usage subject to each provider's terms of service.
