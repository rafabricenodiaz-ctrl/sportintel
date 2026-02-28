'use client'
// app/bets/page.js — Value Bets
import { useState, useEffect } from 'react'
import Shell from '@/components/Shell'
import {
  Card, SectionHeader, EdgeBadge, SportBadge,
  SkeletonRows, Empty, ErrorBanner, FilterPill, RefreshBtn,
  Table, Th, Td,
} from '@/components/UI'
import { formatDate } from '@/lib/api'
import { TrendingUp, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

const EDGE_FILTERS = [
  { label: 'All',    min: 0    },
  { label: '≥ 2%',   min: 0.02 },
  { label: '≥ 4%',   min: 0.04 },
  { label: '≥ 8%',   min: 0.08 },
]

const SPORT_LABELS = {
  basketball_nba:            'NBA',
  soccer_epl:                'EPL',
  soccer_spain_la_liga:      'La Liga',
  soccer_germany_bundesliga: 'Bundesliga',
  soccer_italy_serie_a:      'Serie A',
  soccer_france_ligue_one:   'Ligue 1',
  soccer_usa_mls:            'MLS',
  soccer_mexico_ligamx:      'Liga MX',
  soccer_uefa_champs_league: 'UCL',
  americanfootball_nfl:      'NFL',
}

export default function BetsPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [edgeMin, setEdgeMin] = useState(0.02)
  const [sport,   setSport]   = useState('all')
  const [sortKey, setSortKey] = useState('edge')

  const load = () => {
    setLoading(true)
    setError(null)
    fetch('/api/odds')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const allBets   = data?.decisions || []
  const sports    = [...new Set(allBets.map(b => b.sportKey))]

  let bets = allBets.filter(b => b.edge >= edgeMin)
  if (sport !== 'all') bets = bets.filter(b => b.sportKey === sport)

  bets = [...bets].sort((a, b) => {
    if (sortKey === 'edge')  return (b.edge || 0) - (a.edge || 0)
    if (sortKey === 'time')  return new Date(a.commence_time) - new Date(b.commence_time)
    if (sortKey === 'price') return (Number(b.bestPrice) || 0) - (Number(a.bestPrice) || 0)
    return 0
  })

  return (
    <Shell>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-accent" />
            <span className="text-xs font-mono text-dim uppercase tracking-widest">Value Finder</span>
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Value Bets</h1>
          {data?.fetchedAt && (
            <p className="text-xs text-dim mt-1 font-mono">Updated {formatDate(data.fetchedAt)}</p>
          )}
        </div>
        <RefreshBtn onClick={load} loading={loading} />
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Edge filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-dim mr-1">Edge</span>
            {EDGE_FILTERS.map(f => (
              <FilterPill key={f.min} active={edgeMin === f.min} onClick={() => setEdgeMin(f.min)}>
                {f.label}
              </FilterPill>
            ))}
          </div>
          {/* Sport filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-dim mr-1">Sport</span>
            <FilterPill active={sport === 'all'} onClick={() => setSport('all')}>All</FilterPill>
            {sports.map(s => (
              <FilterPill key={s} active={sport === s} onClick={() => setSport(s)}>
                {SPORT_LABELS[s] || s}
              </FilterPill>
            ))}
          </div>
          {/* Sort */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs font-mono text-dim mr-1">Sort</span>
            {['edge','time','price'].map(k => (
              <FilterPill key={k} active={sortKey === k} onClick={() => setSortKey(k)}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </FilterPill>
            ))}
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="mb-3 text-xs font-mono text-dim">
        {loading ? '…' : `${bets.length} bets found`}
      </div>

      {/* Table */}
      {loading ? <SkeletonRows rows={8} /> : !bets.length ? (
        <Empty message="No value bets match your filters." icon={AlertCircle} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Match</Th>
              <Th>Pick</Th>
              <Th>Book</Th>
              <Th right>Price</Th>
              <Th right>Impl %</Th>
              <Th right>Avg Impl</Th>
              <Th right>Edge</Th>
              <Th>Kickoff</Th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet, i) => (
              <tr key={i} className="hover:bg-muted/20 transition-colors">
                <Td>
                  <div className="flex flex-col gap-1">
                    <span className="text-text font-medium text-sm">{bet.matchup}</span>
                    <SportBadge sportKey={bet.sportKey} />
                  </div>
                </Td>
                <Td>
                  <span className="text-accent font-semibold">{bet.pick}</span>
                </Td>
                <Td>
                  <span className="text-dim font-mono text-xs">{bet.bestBook}</span>
                </Td>
                <Td right>
                  <span className={clsx(
                    'font-mono font-medium',
                    Number(bet.bestPrice) > 0 ? 'text-accent' : 'text-text'
                  )}>
                    {Number(bet.bestPrice) > 0 ? '+' : ''}{bet.bestPrice}
                  </span>
                </Td>
                <Td right>
                  <span className="text-text font-mono text-sm">
                    {bet.bestImplied != null ? (bet.bestImplied * 100).toFixed(1) + '%' : '—'}
                  </span>
                </Td>
                <Td right>
                  <span className="text-dim font-mono text-sm">
                    {bet.avgImplied != null ? (bet.avgImplied * 100).toFixed(1) + '%' : '—'}
                  </span>
                </Td>
                <Td right>
                  <EdgeBadge edge={bet.edge} />
                </Td>
                <Td>
                  <span className="text-dim font-mono text-xs">{formatDate(bet.commence_time)}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Shell>
  )
}
