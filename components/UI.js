'use client'
// components/UI.js — shared UI primitives

import clsx from 'clsx'

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, className = '', glow = false }) {
  return (
    <div className={clsx(
      'bg-surface border border-border rounded-xl p-5',
      glow && 'shadow-lg shadow-accent/5 border-accent/20',
      className
    )}>
      {children}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, accent = false }) {
  return (
    <Card glow={accent}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-dim mb-2">{label}</div>
          <div className={clsx(
            'text-3xl font-bold tracking-tight',
            accent ? 'text-accent' : 'text-text'
          )}>{value}</div>
          {sub && <div className="text-xs text-dim mt-1 font-mono">{sub}</div>}
        </div>
        {Icon && (
          <div className={clsx(
            'w-9 h-9 rounded-lg flex items-center justify-center',
            accent ? 'bg-accent/15 text-accent' : 'bg-muted/50 text-dim'
          )}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Edge badge ────────────────────────────────────────────────────────────
export function EdgeBadge({ edge }) {
  if (edge == null) return null
  const pct  = (edge * 100).toFixed(1)
  const cls  = edge >= 0.08 ? 'bg-accent/15 text-accent border-accent/30'
             : edge >= 0.04 ? 'bg-warn/15 text-warn border-warn/30'
             : edge >= 0.02 ? 'bg-info/15 text-info border-info/30'
             :                'bg-muted/20 text-dim border-border'
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-mono font-medium', cls)}>
      +{pct}%
    </span>
  )
}

// ── Sport badge ───────────────────────────────────────────────────────────
export function SportBadge({ sportKey }) {
  const label = sportKey
    ?.replace('soccer_', '')
    ?.replace('basketball_', '')
    ?.replace('americanfootball_', '')
    ?.replace(/_/g, ' ')
    ?.toUpperCase()
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted/50 border border-border text-xs font-mono text-dim">
      {label}
    </span>
  )
}

// ── Price pill ────────────────────────────────────────────────────────────
export function PricePill({ price, best = false }) {
  const p = Number(price)
  const txt = isNaN(p) ? '—' : p > 0 ? `+${p}` : String(p)
  return (
    <span className={clsx(
      'inline-block font-mono text-sm font-medium px-2 py-0.5 rounded',
      best ? 'text-accent bg-accent/10' : 'text-text'
    )}>
      {txt}
    </span>
  )
}

// ── Section header ────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, children }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-lg font-bold text-text tracking-tight">{title}</h2>
        {sub && <p className="text-xs text-dim mt-0.5 font-mono">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────
export function Empty({ message = 'No data', icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-dim">
      {Icon && <Icon size={32} className="mb-3 opacity-40" />}
      <p className="text-sm font-mono">{message}</p>
    </div>
  )
}

// ── Error banner ──────────────────────────────────────────────────────────
export function ErrorBanner({ message }) {
  return (
    <div className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-3 text-danger text-sm font-mono">
      {message}
    </div>
  )
}

// ── Loading skeleton rows ─────────────────────────────────────────────────
export function SkeletonRows({ rows = 6 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full rounded-lg" style={{ opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  )
}

// ── Table wrapper ─────────────────────────────────────────────────────────
export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, right = false }) {
  return (
    <th className={clsx(
      'px-4 py-3 text-xs font-mono uppercase tracking-wider text-dim bg-muted/30 border-b border-border',
      right ? 'text-right' : 'text-left'
    )}>
      {children}
    </th>
  )
}

export function Td({ children, right = false, className = '' }) {
  return (
    <td className={clsx('px-4 py-3 border-b border-border/50', right && 'text-right', className)}>
      {children}
    </td>
  )
}

// ── Filter pill button ────────────────────────────────────────────────────
export function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all',
        active
          ? 'bg-accent/15 text-accent border-accent/30'
          : 'bg-muted/30 text-dim border-border hover:text-text hover:border-muted'
      )}
    >
      {children}
    </button>
  )
}

// ── Refresh button ────────────────────────────────────────────────────────
export function RefreshBtn({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-mono text-dim hover:text-text transition-all disabled:opacity-50"
    >
      <span className={clsx('inline-block', loading && 'animate-spin')}>↻</span>
      {loading ? 'Loading…' : 'Refresh'}
    </button>
  )
}
