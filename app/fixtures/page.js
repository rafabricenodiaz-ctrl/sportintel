'use client'
// app/fixtures/page.js — Soccer Fixtures & Injuries
import { useState, useEffect } from 'react'
import Shell from '../../components/Shell'
import {
  Card, SectionHeader, SkeletonRows, Empty,
  ErrorBanner, FilterPill, RefreshBtn, Table, Th, Td,
} from '../../components/UI'
import { formatDate } from '../../lib/api'
import { Trophy, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const STATUS_COLOR = {
  NS:  'text-info',
  '1H':'text-accent',
  HT: 'text-warn',
  '2H':'text-accent',
  FT: 'text-dim',
  AET:'text-dim',
  PEN:'text-dim',
  PST:'text-warn',
  CANC:'text-danger',
  ABD:'text-danger',
}

export default function FixturesPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [tab,     setTab]     = useState('fixtures')
  const [filter,  setFilter]  = useState('all')

  const load = () => {
    setLoading(true); setError(null)
    fetch('/api/soccer')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const fixtures = data?.fixtures || []
  const injuries = data?.injuries || []
  const leagues  = [...new Set(fixtures.map(f => f.leagueName))]

  const shown = filter === 'all' ? fixtures : fixtures.filter(f => f.leagueName === filter)

  // Group injuries by fixture
  const injByFixture = {}
  injuries.forEach(inj => {
    if (!injByFixture[inj.fixtureId]) injByFixture[inj.fixtureId] = []
    injByFixture[inj.fixtureId].push(inj)
  })

  return (
    <Shell>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={14} className="text-warn" />
            <span className="text-xs font-mono text-dim uppercase tracking-widest">Soccer</span>
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Fixtures & Injuries</h1>
          {data?.fetchedAt && (
            <p className="text-xs text-dim mt-1 font-mono">Updated {formatDate(data.fetchedAt)}</p>
          )}
        </div>
        <RefreshBtn onClick={load} loading={loading} />
      </div>

      {error && (
        <div className="mb-5">
          <ErrorBanner message={
            error.includes('not configured')
              ? 'FOOTBALL_API_KEY not set. Add it in Settings to see fixtures.'
              : error
          } />
        </div>
      )}

      {/* Tab switch */}
      <div className="flex gap-2 mb-5">
        <FilterPill active={tab === 'fixtures'} onClick={() => setTab('fixtures')}>
          Fixtures ({fixtures.length})
        </FilterPill>
        <FilterPill active={tab === 'injuries'} onClick={() => setTab('injuries')}>
          Injuries ({injuries.length})
        </FilterPill>
      </div>

      {tab === 'fixtures' && (
        <>
          {/* League filter */}
          <Card className="mb-5">
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>All Leagues</FilterPill>
              {leagues.map(l => (
                <FilterPill key={l} active={filter === l} onClick={() => setFilter(l)}>{l}</FilterPill>
              ))}
            </div>
          </Card>

          {loading ? <SkeletonRows rows={6} /> : !shown.length ? (
            <Empty
              message={error ? 'Set FOOTBALL_API_KEY to load fixtures.' : 'No fixtures in range.'}
              icon={Trophy}
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>League</Th>
                  <Th>Match</Th>
                  <Th>Status</Th>
                  <Th>Kickoff</Th>
                  <Th>Venue</Th>
                  <Th right>Injuries</Th>
                </tr>
              </thead>
              <tbody>
                {shown.map((f, i) => {
                  const injCount = (injByFixture[f.fixtureId] || []).length
                  return (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <Td>
                        <span className="text-xs font-mono text-dim">{f.leagueName}</span>
                      </Td>
                      <Td>
                        <div className="font-medium text-text">{f.homeTeam}</div>
                        <div className="text-xs text-dim font-mono">vs {f.awayTeam}</div>
                      </Td>
                      <Td>
                        <span className={clsx(
                          'text-xs font-mono font-medium',
                          STATUS_COLOR[f.status] || 'text-dim'
                        )}>
                          {f.status || '—'}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-xs font-mono text-dim">{formatDate(f.date)}</span>
                      </Td>
                      <Td>
                        <span className="text-xs text-dim">{f.venue || '—'}</span>
                      </Td>
                      <Td right>
                        {injCount > 0 ? (
                          <span className="flex items-center justify-end gap-1 text-warn text-xs font-mono">
                            <AlertTriangle size={11} />
                            {injCount}
                          </span>
                        ) : (
                          <span className="text-dim text-xs font-mono">—</span>
                        )}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </>
      )}

      {tab === 'injuries' && (
        <>
          {loading ? <SkeletonRows rows={6} /> : !injuries.length ? (
            <Empty message="No injuries reported or FOOTBALL_API_KEY not set." icon={AlertTriangle} />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Player</Th>
                  <Th>Team</Th>
                  <Th>Type</Th>
                  <Th>Reason</Th>
                  <Th right>Fixture ID</Th>
                </tr>
              </thead>
              <tbody>
                {injuries.map((inj, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <Td><span className="text-text font-medium">{inj.player}</span></Td>
                    <Td><span className="text-dim text-sm">{inj.team}</span></Td>
                    <Td>
                      <span className="text-xs font-mono text-warn">{inj.type || '—'}</span>
                    </Td>
                    <Td><span className="text-dim text-xs">{inj.reason || '—'}</span></Td>
                    <Td right>
                      <span className="text-dim text-xs font-mono">{inj.fixtureId}</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Shell>
  )
}
