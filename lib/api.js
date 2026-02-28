// lib/api.js — shared helpers for all Sports Intel API routes

export const SOCCER_SPORT_KEYS = [
  'soccer_uefa_champs_league',
  'soccer_epl',
  'soccer_spain_la_liga',
  'soccer_germany_bundesliga',
  'soccer_italy_serie_a',
  'soccer_france_ligue_one',
  'soccer_usa_mls',
  'soccer_mexico_ligamx',
]

export const FOOTBALL_LEAGUE_IDS = {
  soccer_uefa_champs_league: 2,
  soccer_epl:                39,
  soccer_spain_la_liga:      140,
  soccer_germany_bundesliga: 78,
  soccer_italy_serie_a:      135,
  soccer_france_ligue_one:   61,
  soccer_usa_mls:            253,
  soccer_mexico_ligamx:      262,
}

// Calendar-year leagues (MLS, Liga MX) vs start-year leagues (European)
const CALENDAR_YEAR_LEAGUE_IDS = [253, 262]

export function getSoccerSeason(leagueId) {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth() + 1
  if (CALENDAR_YEAR_LEAGUE_IDS.includes(leagueId)) return year
  return month >= 8 ? year : year - 1
}

// American odds → implied probability
export function americanToImplied(price) {
  const p = Number(price)
  if (isNaN(p) || p === 0) return null
  if (p > 0) return 100 / (p + 100)
  return Math.abs(p) / (Math.abs(p) + 100)
}

// Implied probability → American odds (for display)
export function impliedToAmerican(prob) {
  if (!prob || prob <= 0 || prob >= 1) return null
  if (prob <= 0.5) return Math.round(100 / prob - 100)
  return Math.round(-prob / (1 - prob) * 100)
}

// Format American price for display e.g. +150, -110
export function formatPrice(price) {
  const p = Number(price)
  if (isNaN(p)) return '—'
  return p > 0 ? '+' + p : String(p)
}

// Edge = avg_implied - best_implied (positive = value)
export function computeEdge(bestImplied, avgImplied) {
  if (bestImplied == null || avgImplied == null) return null
  return avgImplied - bestImplied
}

// Process raw odds API response into best-odds + decisions rows
export function processOddsData(events, sportKey, minEdge = 0.02) {
  const rawRows   = []
  const bestRows  = []
  const decisions = []
  const fetchedAt = new Date().toISOString()

  events.forEach(event => {
    const { id: eventId, sport_title, commence_time,
            home_team, away_team, bookmakers = [] } = event
    const matchup = `${home_team} vs ${away_team}`

    // Collect all prices per market/outcome across bookmakers
    const priceMap = {}

    bookmakers.forEach(book => {
      ;(book.markets || []).forEach(mkt => {
        ;(mkt.outcomes || []).forEach(outcome => {
          rawRows.push({
            fetchedAt, sportKey, sport_title, commence_time,
            eventId, home_team, away_team,
            bookmaker: book.key,
            market: mkt.key,
            outcome: outcome.name,
            price: outcome.price,
          })
          const k = `${mkt.key}::${outcome.name}`
          if (!priceMap[k]) priceMap[k] = []
          priceMap[k].push({ book: book.key, price: outcome.price,
                             market: mkt.key, outcomeName: outcome.name })
        })
      })
    })

    Object.values(priceMap).forEach(entries => {
      if (!entries.length) return
      const { market, outcomeName } = entries[0]

      const withImplied = entries
        .map(e => ({ ...e, implied: americanToImplied(e.price) }))
        .filter(e => e.implied !== null)

      if (!withImplied.length) return

      withImplied.sort((a, b) => a.implied - b.implied)
      const best = withImplied[0]
      const avgImplied = withImplied.reduce((s, e) => s + e.implied, 0) / withImplied.length
      const edge = computeEdge(best.implied, avgImplied)

      const row = {
        fetchedAt, sportKey, commence_time, matchup,
        home_team, away_team, market, outcome: outcomeName,
        bestPrice:   best.price,
        bestBook:    best.book,
        bestImplied: best.implied != null ? +best.implied.toFixed(4) : null,
        avgImplied:  +avgImplied.toFixed(4),
        edge:        edge != null ? +edge.toFixed(4) : null,
        allBooks:    withImplied.map(e => ({ book: e.book, price: e.price,
                                            implied: +e.implied.toFixed(4) })),
      }
      bestRows.push(row)

      if (edge != null && edge >= minEdge) {
        decisions.push({
          ...row,
          createdAt: fetchedAt,
          pick: outcomeName,
        })
      }
    })
  })

  return { rawRows, bestRows, decisions }
}

// Safe fetch wrapper
export async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) })
    if (!res.ok) return { data: null, error: `HTTP ${res.status}` }
    const data = await res.json()
    return { data, error: null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}

// Format a date string for display
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZoneName: 'short',
  })
}

export function formatDateShort(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// Edge colour class
export function edgeColor(edge) {
  if (edge == null) return 'text-dim'
  if (edge >= 0.08) return 'text-accent'
  if (edge >= 0.04) return 'text-warn'
  if (edge >= 0.02) return 'text-info'
  return 'text-dim'
}

export function edgeBadge(edge) {
  if (edge == null) return ''
  if (edge >= 0.08) return 'bg-accent/20 text-accent border-accent/30'
  if (edge >= 0.04) return 'bg-warn/20 text-warn border-warn/30'
  if (edge >= 0.02) return 'bg-info/20 text-info border-info/30'
  return 'bg-muted/20 text-dim border-border'
}
