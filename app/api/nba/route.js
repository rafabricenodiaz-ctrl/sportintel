// app/api/nba/route.js
import { NextResponse } from 'next/server'
import { safeFetch } from '../../../lib/api'

const BDL_BASE = 'https://api.balldontlie.io/v1'

export async function GET() {
  const apiKey = process.env.BALLDONTLIE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'BALLDONTLIE_API_KEY not configured' }, { status: 400 })
  }

  const { data, error } = await safeFetch(`${BDL_BASE}/teams`, {
    headers: { Authorization: apiKey },
  })

  if (error || !data) {
    return NextResponse.json({ error: error || 'No data from BallDontLie' }, { status: 502 })
  }

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    teams: data.data || [],
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
  })
}
