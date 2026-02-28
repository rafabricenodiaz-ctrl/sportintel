// app/api/soccer/route.js
import { NextResponse } from 'next/server'
import { SOCCER_SPORT_KEYS, FOOTBALL_LEAGUE_IDS, getSoccerSeason, safeFetch } from '@/lib/api'

const APISPORTS_BASE = 'https://v3.football.api-sports.io'
const RAPIDAPI_BASE  = 'https://api-football-v1.p.rapidapi.com/v3'

function footballUrl(path) {
  const mode = process.env.FOOTBALL_MODE || 'apisports'
  return mode === 'rapidapi' ? RAPIDAPI_BASE + path : APISPORTS_BASE + path
}

function footballHeaders() {
  const mode   = process.env.FOOTBALL_MODE || 'apisports'
  const apiKey = process.env.FOOTBALL_API_KEY || ''
  if (mode === 'rapidapi') {
    return {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key':  apiKey,
    }
  }
  return { 'x-apisports-key': apiKey }
}

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function fmtDate(d) {
  return d.toISOString().split('T')[0]
}

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FOOTBALL_API_KEY not configured' }, { status: 400 })
  }

  const daysAhead = parseInt(process.env.DAYS_AHEAD) || 2
  const today     = new Date()
  const fixtures  = []
  const injuries  = []
  const errors    = []

  for (const sportKey of SOCCER_SPORT_KEYS) {
    const leagueId = FOOTBALL_LEAGUE_IDS[sportKey]
    if (!leagueId) continue

    const season = getSoccerSeason(leagueId)

    for (let d = -1; d <= daysAhead; d++) {
      const dateStr = fmtDate(addDays(today, d))
      const url     = footballUrl(`/fixtures?league=${leagueId}&season=${season}&date=${dateStr}`)
      const { data, error } = await safeFetch(url, { headers: footballHeaders() })

      if (error || !data) {
        errors.push({ sportKey, date: dateStr, error: error || 'No data' })
        continue
      }
      if (!data.response?.length) continue

      for (const f of data.response) {
        const { fixture, league, teams } = f
        fixtures.push({
          fetchedAt:  new Date().toISOString(),
          leagueId:   league.id,
          leagueName: league.name,
          fixtureId:  fixture.id,
          date:       fixture.date,
          homeTeam:   teams.home.name,
          awayTeam:   teams.away.name,
          status:     fixture.status?.short || '',
          venue:      fixture.venue?.name   || '',
          leagueLogo: league.logo  || '',
          homeLogo:   teams.home.logo || '',
          awayLogo:   teams.away.logo || '',
        })

        // Fetch injuries for this fixture
        const injUrl = footballUrl(`/injuries?fixture=${fixture.id}`)
        const { data: injData } = await safeFetch(injUrl, { headers: footballHeaders() })
        if (injData?.response?.length) {
          for (const inj of injData.response) {
            injuries.push({
              fixtureId:  fixture.id,
              leagueId:   league.id,
              team:       inj.team?.name    || '',
              player:     inj.player?.name  || '',
              type:       inj.player?.type  || '',
              reason:     inj.player?.reason|| '',
              photo:      inj.player?.photo || '',
            })
          }
        }
      }
    }
  }

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    fixtures,
    injuries,
    errors,
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
