'use client'
// components/Sidebar.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Activity,
  Trophy, Users, Settings, Zap,
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/bets',      icon: TrendingUp,      label: 'Value Bets' },
  { href: '/odds',      icon: Activity,        label: 'Live Odds'  },
  { href: '/fixtures',  icon: Trophy,          label: 'Fixtures'   },
  { href: '/nba',       icon: Users,           label: 'NBA Teams'  },
  { href: '/settings',  icon: Settings,        label: 'Settings'   },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-surface border-r border-border z-40 flex flex-col">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
            <Zap size={16} className="text-bg" fill="currentColor" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-widest uppercase text-text">Sports</div>
            <div className="text-xs font-mono text-accent tracking-widest">INTEL</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-dim hover:text-text hover:bg-muted/50'
              )}
            >
              <Icon size={16} className={active ? 'text-accent' : 'text-dim'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Status footer */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-dim">
          <span className="w-1.5 h-1.5 rounded-full bg-accent live-dot" />
          Live data
        </div>
        <div className="mt-1 text-xs text-dim font-mono">
          Powered by The Odds API
        </div>
      </div>
    </aside>
  )
}
