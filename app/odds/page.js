'use client'
// app/odds/page.js — Live Odds Explorer
import { useState, useEffect } from 'react'
import Shell from '@/components/Shell'
import {
  Card, SectionHeader, SportBadge, EdgeBadge,
  SkeletonRows, Empty, ErrorBanner, FilterPill, RefreshBtn,
  Table, Th, Td,
} from '@/components/UI'
import { formatDate } from '@/lib/api'
import { Activity } from 'lucide-react'
import clsx from 'clsx'

export default function OddsPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [sport,   setSport]   = useState('all')
  const [search,  setSearch]  = useState('')

  const load = () => {
    setLoading(true); setError(null)
    fetch('/api/odds')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const allBest = data?.bestOdds || []
  const sports  = [...new Set(allBest.map(b => b.sportKey))]

  let rows = allBest
  if (sport !== 'all') rows = rows.filter(r => r.sportKey === sport)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(r =>
      r.matchup?.toLowerCase().includes(q) ||
      r.outcome?.toLowerCase().includes(q)
    )
  }

  return (
    <Shell>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-info" />
            <span className="text-xs font-mono text-dim uppercase tracking-widest">Odds Explorer</span>
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Live Odds</h1>
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
          {/* Search */}
          <input
            type="text"
            placeholder="Search team or matchup…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-text placeholder-dim focus:outline-none focus:border-accent/50 w-56"
          />
          {/* Sport filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterPill active={sport === 'all'} onClick={() => setSport('all')}>All</FilterPill>
            {sports.map(s => (
              <FilterPill key={s} active={sport === s} onClick={() => setSport(s)}>
                {s.replace('soccer_','').replace('basketball_','').replace(/_/g,' ').toUpperCase()}
              </FilterPill>
            ))}
          </div>
        </div>
      </Card>

      <div className="mb-3 text-xs font-mono text-dim">
        {loading ? '…' : `${rows.length} outcomes`}
      </div>

      {loading ? <SkeletonRows rows={8} /> : !rows.length ? (
        <Empty message="No odds data. Check your API key in settings." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Matchup</Th>
              <Th>Outcome</Th>
              <Th>Market</Th>
              <Th right>Best Price</Th>
              <Th>Best Book</Th>
              <Th right>Impl %</Th>
              <Th right>Edge</Th>
              <Th>All Books</Th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 200).map((row, i) => (
              <tr key={i} className="hover:bg-muted/20 transition-colors">
                <Td>
                  <div className="flex flex-col gap-1">
                    <span className="text-text text-sm">{row.matchup}</span>
                    <SportBadge sportKey={row.sportKey} />
                  </div>
                </Td>
                <Td>
                  <span className={row.edge >= 0.02 ? 'text-accent font-semibold' : 'text-text'}>
                    {row.outcome}
                  </span>
                </Td>
                <Td>
                  <span className="text-dim font-mono text-xs">{row.market}</span>
                </Td>
                <Td right>
                  <span className={clsx(
                    'font-mono font-medium',
                    Number(row.bestPrice) > 0 ? 'text-accent' : 'text-text'
                  )}>
                    {Number(row.bestPrice) > 0 ? '+' : ''}{row.bestPrice}
                  </span>
                </Td>
                <Td>
                  <span className="text-dim font-mono text-xs">{row.bestBook}</span>
                </Td>
                <Td right>
                  <span className="text-text font-mono text-sm">
                    {row.bestImplied != null ? (row.bestImplied * 100).toFixed(1) + '%' : '—'}
                  </span>
                </Td>
                <Td right>
                  {row.edge >= 0.02
                    ? <EdgeBadge edge={row.edge} />
                    : <span className="text-dim font-mono text-xs">{row.edge != null ? (row.edge * 100).toFixed(1) + '%' : '—'}</span>
                  }
                </Td>
                <Td>
                  <div className="flex gap-1 flex-wrap">
                    {(row.allBooks || []).map((b, j) => (
                      <span key={j} className="text-xs font-mono text-dim">
                        {b.book}: <span className="text-text">{Number(b.price) > 0 ? '+' : ''}{b.price}</span>
                        {j < (row.allBooks.length - 1) ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {rows.length > 200 && (
        <p className="text-xs text-dim font-mono mt-3">Showing first 200 of {rows.length} — use filters to narrow down.</p>
      )}
    </Shell>
  )
}
