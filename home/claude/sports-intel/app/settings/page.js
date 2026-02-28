'use client'
// app/settings/page.js — Settings & Setup Guide
import Shell from '@/components/Shell'
import { Card, SectionHeader } from '@/components/UI'
import { Settings, Key, ExternalLink, CheckCircle, Circle, BookOpen } from 'lucide-react'

const ENV_VARS = [
  {
    key:      'ODDS_API_KEY',
    required: true,
    label:    'The Odds API Key',
    desc:     'Powers all odds data, value bets, and decisions. Free tier: 500 requests/month.',
    link:     'https://the-odds-api.com',
    linkText: 'Get key at the-odds-api.com',
  },
  {
    key:      'FOOTBALL_API_KEY',
    required: false,
    label:    'API-Football Key',
    desc:     'Enables soccer fixtures and injury data. Free tier: 100 requests/day.',
    link:     'https://www.api-football.com',
    linkText: 'Get key at api-football.com',
  },
  {
    key:      'FOOTBALL_MODE',
    required: false,
    label:    'Football API Mode',
    desc:     'Set to "apisports" (default) or "rapidapi" depending on your account type.',
    link:     null,
  },
  {
    key:      'BALLDONTLIE_API_KEY',
    required: false,
    label:    'BallDontLie API Key',
    desc:     'Enables NBA team data. Free tier available.',
    link:     'https://www.balldontlie.io',
    linkText: 'Get key at balldontlie.io',
  },
  {
    key:      'REGIONS',
    required: false,
    label:    'Regions',
    desc:     'Bookmaker regions to fetch. Default: "us". Options: us, uk, eu, au (comma-separated).',
    link:     null,
  },
  {
    key:      'MARKETS',
    required: false,
    label:    'Markets',
    desc:     'Bet markets to include. Default: "h2h". Options: h2h, spreads, totals.',
    link:     null,
  },
  {
    key:      'MIN_VALUE_EDGE',
    required: false,
    label:    'Min Value Edge',
    desc:     'Minimum edge % to appear in Value Bets. Default: 0.02 (2%).',
    link:     null,
  },
  {
    key:      'DAYS_AHEAD',
    required: false,
    label:    'Days Ahead',
    desc:     'How many days ahead to fetch soccer fixtures. Default: 2.',
    link:     null,
  },
]

const DEPLOY_STEPS = [
  {
    step: '1',
    title: 'Fork or clone the repo to GitHub',
    body: 'Push all files to a new GitHub repository (public or private).',
  },
  {
    step: '2',
    title: 'Connect to Vercel',
    body: 'Go to vercel.com → New Project → Import your GitHub repo. Vercel auto-detects Next.js.',
  },
  {
    step: '3',
    title: 'Add environment variables',
    body: 'In Vercel: Project → Settings → Environment Variables. Add each key from the table below.',
  },
  {
    step: '4',
    title: 'Deploy',
    body: 'Click Deploy. Your app will be live at yourusername.vercel.app in ~60 seconds.',
  },
  {
    step: '5',
    title: 'Auto-updates',
    body: 'Every git push to main auto-deploys. Data refreshes on each page visit (3-min server cache).',
  },
]

export default function SettingsPage() {
  return (
    <Shell>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={14} className="text-dim" />
          <span className="text-xs font-mono text-dim uppercase tracking-widest">Configuration</span>
        </div>
        <h1 className="text-3xl font-bold text-text tracking-tight">Settings & Setup</h1>
        <p className="text-dim text-sm mt-1">How to configure and deploy your Sports Intel app.</p>
      </div>

      {/* Deploy steps */}
      <SectionHeader title="Deployment Steps" sub="Get live on Vercel in 5 minutes" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-10">
        {DEPLOY_STEPS.map(({ step, title, body }) => (
          <Card key={step} className="relative">
            <div className="text-3xl font-bold text-accent/20 font-mono mb-2">{step}</div>
            <div className="text-sm font-semibold text-text mb-1">{title}</div>
            <div className="text-xs text-dim leading-relaxed">{body}</div>
          </Card>
        ))}
      </div>

      {/* Env vars table */}
      <SectionHeader
        title="Environment Variables"
        sub="Set these in Vercel → Project → Settings → Environment Variables"
      />

      <Card className="mb-8">
        <div className="bg-bg/60 border border-border rounded-lg p-4 mb-4 font-mono text-xs text-dim">
          <div className="text-accent mb-2"># .env.local (local dev)</div>
          {ENV_VARS.map(v => (
            <div key={v.key} className="text-text">
              <span className="text-info">{v.key}</span>
              <span className="text-dim">=your_value_here</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-dim font-mono">
          ⚠ Never commit .env.local to git. It's already in .gitignore.
        </p>
      </Card>

      <div className="space-y-3 mb-10">
        {ENV_VARS.map(v => (
          <Card key={v.key} className="flex items-start gap-4">
            <div className="mt-0.5 shrink-0">
              {v.required
                ? <CheckCircle size={16} className="text-accent" />
                : <Circle      size={16} className="text-dim" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-sm text-text font-medium">{v.key}</span>
                {v.required && (
                  <span className="text-xs bg-accent/15 text-accent border border-accent/30 px-1.5 py-0.5 rounded font-mono">
                    required
                  </span>
                )}
              </div>
              <div className="text-xs text-dim leading-relaxed">{v.desc}</div>
              {v.link && (
                <a
                  href={v.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-info hover:text-accent mt-1.5 font-mono transition-colors"
                >
                  <ExternalLink size={11} />
                  {v.linkText}
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Local dev */}
      <SectionHeader title="Local Development" sub="Run the app on your machine" />
      <Card className="font-mono text-xs">
        <div className="space-y-1.5">
          {[
            '# 1. Clone your repo',
            'git clone https://github.com/YOU/sports-intel && cd sports-intel',
            '',
            '# 2. Install dependencies',
            'npm install',
            '',
            '# 3. Create your env file',
            'cp .env.example .env.local',
            '# Then edit .env.local and add your API keys',
            '',
            '# 4. Start dev server',
            'npm run dev',
            '# → Open http://localhost:3000',
          ].map((line, i) => (
            <div key={i} className={line.startsWith('#') ? 'text-dim' : line === '' ? 'h-2' : 'text-text'}>
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </Card>

      {/* Notes */}
      <div className="mt-8 p-4 bg-muted/20 border border-border rounded-xl">
        <div className="flex items-start gap-2">
          <BookOpen size={14} className="text-dim mt-0.5 shrink-0" />
          <div className="text-xs text-dim leading-relaxed space-y-1">
            <p><span className="text-text">API keys are server-side only.</span> They live in Vercel environment variables and are never sent to your browser.</p>
            <p><span className="text-text">Data caching.</span> Odds cache for 3 minutes, fixtures for 5 minutes, NBA teams for 1 hour — so you won't burn through free-tier limits.</p>
            <p><span className="text-text">Only ODDS_API_KEY is required.</span> Soccer and NBA tabs gracefully show a "key not configured" message if those optional keys are missing.</p>
          </div>
        </div>
      </div>
    </Shell>
  )
}
