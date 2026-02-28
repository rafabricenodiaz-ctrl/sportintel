'use client'
// app/nba/page.js — NBA Teams
import { useState, useEffect } from 'react'
import Shell from '../../components/Shell'
import {
  Card, SectionHeader, SkeletonRows, Empty,
  ErrorBanner, FilterPill, RefreshBtn, Table, Th, Td,
} from '../../components/UI'
import { Users } from 'lucide-react'

const CONFERENCES = ['All', 'East', 'West']
const DIVISIONS   = ['All', 'Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest']

export default function NBAPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [conf,    setConf]    = useState('All')
  const [div,     setDiv]     = useState('All')
  const [search,  setSearch]  = useState('')

  const load = () => {
    setLoading(true); setError(null)
    fetch('/api/nba')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const teams = data?.teams || []

  let shown = teams
  if (conf !== 'All') shown = shown.filter(t => t.conference === conf)
  if (div  !== 'All') shown = shown.filter(t => t.division   === div)
  if (search) {
    const q = search.toLowerCase()
    shown = shown.filter(t =>
      t.full_name?.toLowerCase().includes(q) ||
      t.city?.toLowerCase().includes(q) ||
      t.abbreviation?.toLowerCase().includes(q)
    )
  }

  return (
    <Shell>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-info" />
            <span className="text-xs font-mono text-dim uppercase tracking-widest">Basketball</span>
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight">NBA Teams</h1>
          {data?.fetchedAt && (
            <p className="text-xs text-dim mt-1 font-mono">
              {teams.length} teams via BallDontLie
            </p>
          )}
        </div>
        <RefreshBtn onClick={load} loading={loading} />
      </div>

      {error && (
        <div className="mb-5">
          <ErrorBanner message={
            error.includes('not configured')
              ? 'BALLDONTLIE_API_KEY not set. Add it in Settings to load NBA data.'
              : error
          } />
        </div>
      )}

      {/* Filters */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search team…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-text placeholder-dim focus:outline-none focus:border-accent/50 w-44"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-dim">Conf</span>
            {CONFERENCES.map(c => (
              <FilterPill key={c} active={conf === c} onClick={() => setConf(c)}>{c}</FilterPill>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-dim">Div</span>
            {DIVISIONS.map(d => (
              <FilterPill key={d} active={div === d} onClick={() => setDiv(d)}>{d}</FilterPill>
            ))}
          </div>
        </div>
      </Card>

      <div className="mb-3 text-xs font-mono text-dim">{loading ? '…' : `${shown.length} teams`}</div>

      {loading ? <SkeletonRows rows={8} /> : !shown.length ? (
        <Empty message="No teams found." icon={Users} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Team</Th>
              <Th>Abbr</Th>
              <Th>City</Th>
              <Th>Conference</Th>
              <Th>Division</Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t, i) => (
              <tr key={i} className="hover:bg-muted/20 transition-colors">
                <Td>
                  <span className="text-text font-semibold">{t.name}</span>
                  <span className="text-dim text-xs ml-2 font-mono">{t.full_name}</span>
                </Td>
                <Td>
                  <span className="font-mono text-accent font-medium">{t.abbreviation}</span>
                </Td>
                <Td><span className="text-dim text-sm">{t.city}</span></Td>
                <Td>
                  <span className={`text-xs font-mono font-medium ${t.conference === 'East' ? 'text-info' : 'text-warn'}`}>
                    {t.conference}
                  </span>
                </Td>
                <Td><span className="text-dim text-xs font-mono">{t.division}</span></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Shell>
  )
}
