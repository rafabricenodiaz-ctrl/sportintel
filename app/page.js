'use client'
// app/page.js — Dashboard
import { useState, useEffect } from 'react'
import Shell from '@/components/Shell'
import { Card, StatCard, EdgeBadge, SportBadge, SectionHeader, SkeletonRows, Empty, ErrorBanner } from '@/components/UI'
import { formatDate } from '@/lib/api'
import { TrendingUp, Activity, Trophy, Zap, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

export default function Dashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetch('/api/odds')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const decisions  = data?.decisions  || []
  const summary    = data?.summary    || []
  const topBets    = decisions.slice(0, 6)
  const totalEvents = summary.reduce((s, x) => s + x.events, 0)

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-accent live-dot" />
          <span className="text-xs font-mono text-dim uppercase tracking-widest">Live</span>
        </div>
        <h1 className="text-3xl font-bold text-text tracking-tight">Dashboard</h1>
        {data?.fetchedAt && (
          <p className="text-xs text-dim mt-1 font-mono">
            Last updated {formatDate(data.fetchedAt)}
          </p>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Value Bets"
          value={loading ? '—' : decisions.length}
          sub="edge ≥ 2%"
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="Events Tracked"
          value={loading ? '—' : totalEvents}
          sub={`${summary.length} sports`}
          icon={Activity}
        />
        <StatCard
          label="Best Edge"
          value={loading ? '—' : decisions[0] ? `+${(decisions[0].edge * 100).toFixed(1)}%` : '—'}
          sub={decisions[0]?.matchup?.split(' vs ')[0] || ''}
          icon={Zap}
          accent={!!decisions[0]}
        />
        <StatCard
          label="Sports Live"
          value={loading ? '—' : summary.filter(s => s.events > 0).length}
          sub="with active odds"
          icon={Trophy}
        />
      </div>

      {/* Top picks + Sports breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Top value bets */}
        <div className="lg:col-span-3">
          <SectionHeader title="Top Value Bets" sub="Highest edge opportunities right now">
            <Link href="/bets" className="text-xs font-mono text-accent hover:underline">
              View all →
            </Link>
          </SectionHeader>

          {loading ? <SkeletonRows rows={5} /> : !topBets.length ? (
            <Empty message="No value bets found. Check ODDS_API_KEY in settings." icon={AlertCircle} />
          ) : (
            <div className="space-y-2">
              {topBets.map((bet, i) => (
                <BetRow key={i} bet={bet} />
              ))}
            </div>
          )}
        </div>

        {/* Sports breakdown */}
        <div className="lg:col-span-2">
          <SectionHeader title="Sports Coverage" sub="Events per sport" />
          {loading ? <SkeletonRows rows={5} /> : !summary.length ? (
            <Empty message="No data" />
          ) : (
            <div className="space-y-2">
              {summary.map((s, i) => (
                <Card key={i} className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-dim">
                      {s.sportKey.replace('soccer_','').replace('basketball_','').replace(/_/g,' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-dim">{s.events} events</span>
                      {s.decisions > 0 && (
                        <span className="text-accent">+{s.decisions} picks</span>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-0.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${Math.min(100, (s.events / 30) * 100)}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}

function BetRow({ bet }) {
  return (
    <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 hover:border-accent/30 transition-colors group">
      <div className="flex-1 min-w-0 mr-3">
        <div className="text-xs text-dim font-mono truncate">{bet.matchup}</div>
        <div className="text-sm font-semibold text-text mt-0.5 truncate">
          <span className="text-accent">{bet.pick}</span>
          <span className="text-dim font-mono font-normal text-xs ml-2">@ {bet.bestBook}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={clsx(
          'font-mono font-medium text-sm',
          Number(bet.bestPrice) > 0 ? 'text-accent' : 'text-text'
        )}>
          {Number(bet.bestPrice) > 0 ? '+' : ''}{bet.bestPrice}
        </span>
        <EdgeBadge edge={bet.edge} />
      </div>
    </div>
  )
}
