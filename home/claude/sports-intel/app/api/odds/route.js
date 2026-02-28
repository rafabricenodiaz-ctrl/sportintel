// app/api/odds/route.js
import { NextResponse } from 'next/server'
import { SOCCER_SPORT_KEYS, processOddsData, safeFetch } from '@/lib/api'

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4'

const NBA_KEY  = 'basketball_nba'
const NFL_KEY  = 'americanfootball_nfl'

function isNflActive() {
  const m = new Date().getMonth() + 1
  return m >= 9 || m <= 2
}

export async function GET(request) {
  const apiKey = process.env.ODDS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ODDS_API_KEY not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const sport    = searchParams.get('sport') || 'all'
  const regions  = process.env.REGIONS       || 'us'
  const markets  = process.env.MARKETS       || 'h2h'
  const format   = process.env.ODDS_FORMAT   || 'american'
  const minEdge  = parseFloat(process.env.MIN_VALUE_EDGE) || 0.02
  const maxEvt   = parseInt(process.env.MAX_EVENTS_PER_SPORT)  || 50

  // Determine which sport keys to fetch
  let sportKeys = []
  if (sport === 'all') {
    sportKeys = [NBA_KEY, ...SOCCER_SPORT_KEYS]
    if (isNflActive()) sportKeys.push(NFL_KEY)
  } else {
    sportKeys = [sport]
  }

  const allDecisions = []
  const allBest      = []
  const allRaw       = []
  const errors       = []
  const summary      = []

  for (const sportKey of sportKeys) {
    const url = `${ODDS_API_BASE}/sports/${sportKey}/odds?apiKey=${apiKey}&regions=${regions}&markets=${markets}&oddsFormat=${format}`
    const { data, error } = await safeFetch(url)

    if (error || !Array.isArray(data)) {
      errors.push({ sportKey, error: error || 'No data' })
      continue
    }

    const events = data.slice(0, maxEvt)
    const result = processOddsData(events, sportKey, minEdge)

    allRaw.push(...result.rawRows)
    allBest.push(...result.bestRows)
    allDecisions.push(...result.decisions)

    summary.push({
      sportKey,
      events:    events.length,
      raw:       result.rawRows.length,
      best:      result.bestRows.length,
      decisions: result.decisions.length,
    })
  }

  // Sort decisions by edge descending
  allDecisions.sort((a, b) => (b.edge || 0) - (a.edge || 0))

  return NextResponse.json({
    fetchedAt:  new Date().toISOString(),
    summary,
    decisions:  allDecisions,
    bestOdds:   allBest,
    rawOdds:    allRaw,
    errors,
  }, {
    headers: {
      // Cache for 3 minutes on Vercel edge
      'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=60',
    },
  })
}
