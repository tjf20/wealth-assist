import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePractice, useMarkets, useClients } from '../hooks/useData.js'
import StatCard from '../components/shared/StatCard.jsx'
import InsightCard from '../components/shared/InsightCard.jsx'
import Avatar from '../components/shared/Avatar.jsx'
import AumChart from '../components/charts/AumChart.jsx'
import { BookHealthChart, HurdleChart } from '../components/charts/BookHealthChart.jsx'

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmtPct = n => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`

const DOT_MAP = { critical: 'dot-red', review: 'dot-amber', info: 'dot-blue', none: 'dot-none' }

const TABS = [
  { id: 'clients',  label: 'Clients',  icon: 'ti-users' },
  { id: 'practice', label: 'Practice', icon: 'ti-chart-bar' },
  { id: 'markets',  label: 'Markets',  icon: 'ti-trending-up' },
]

export default function HomeView() {
  const [tab, setTab] = useState('clients')
  const nav = useNavigate()
  const { data: clients }  = useClients()
  const { data: practice } = usePractice()
  const { data: markets }  = useMarkets()

  return (
    <div style={{ minHeight: 'calc(100vh - 50px)' }}>
      {/* Greeting */}
      <div style={{ padding: '24px 32px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--subtle)', marginBottom: 3 }}>Good morning</div>
          <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>James Whitfield</div>
          <div style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 3 }}>
            {clients?.filter(c => c.alertLevel !== 'none').length ?? '—'} clients need attention
            &nbsp;·&nbsp;
            {clients?.filter(c => c.meetings?.length > 0).length ?? '—'} meetings today
            &nbsp;·&nbsp;
            Book up 4.2% MTD
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(29,78,216,0.08)', border: '0.5px solid rgba(29,78,216,0.2)', borderRadius: 20, padding: '6px 14px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-light)' }} />
            <span style={{ fontSize: 12, color: 'var(--accent-light)' }}>AI monitoring your book</span>
          </div>
          <button className="btn btn-primary" onClick={() => nav('/today')}>
            <i className="ti ti-calendar" aria-hidden="true" /> Today's priorities ↗
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '0.5px solid var(--border)', gap: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            height: 44, display: 'flex', alignItems: 'center', gap: 7,
            padding: '0 20px', fontSize: 13, fontWeight: 500,
            color: tab === t.id ? 'var(--text)' : 'var(--subtle)',
            background: 'transparent', border: 'none',
            borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            <i className={`ti ${t.icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
            {t.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, paddingRight: 4, alignItems: 'center' }}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{
              width: 7, height: 7, borderRadius: '50%', cursor: 'pointer',
              background: tab === t.id ? 'var(--accent)' : 'rgba(255,255,255,0.15)'
            }} />
          ))}
        </div>
      </div>

      {/* ── CLIENTS TAB ── */}
      {tab === 'clients' && (
        <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>
          {/* Left: stats + chart + AI insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
              <StatCard label="Total AUM" value={fmt(practice?.bookHealth?.totalAum ?? 0)} delta="↑ $2.8M MTD" deltaDir="up" />
              <StatCard label="Book YTD return" value={fmtPct(practice?.bookHealth?.ytdReturn ?? 0)} delta={`vs ${fmtPct(practice?.bookHealth?.benchmarkReturn ?? 0)} benchmark`} deltaDir="up" />
              <StatCard label="Clients needing attention" value={String(clients?.filter(c => c.alertLevel !== 'none').length ?? '—')} delta="2 critical · 1 review" deltaDir="down" />
              <StatCard label="Overdue for contact" value={String(practice?.bookHealth?.overdueContact ?? '—')} delta="Longest: 34 days" deltaDir="neutral" />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="ti ti-chart-line" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Book of business — AUM performance</span>
                  <span style={{ fontSize: 11, color: 'var(--subtle)' }}>12-month rolling</span>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(29,78,216,0.55)', display: 'inline-block' }} />
                    AUM ($M)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    Book return %
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'inline-block' }} />
                    S&P 500 %
                  </span>
                </div>
              </div>
              <AumChart history={practice?.bookHealth?.aumHistory ?? []} />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Book health — by segment</span>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--muted)' }}>
                  {[['#22c55e','Healthy'],['#f59e0b','Review'],['#ef4444','At risk']].map(([c,l]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                    </span>
                  ))}
                </div>
              </div>
              <BookHealthChart segments={practice?.bookHealth?.segments ?? []} />
            </div>
          </div>

          {/* Right: AI insights + client list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <i className="ti ti-cpu" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>AI — priority actions</span>
              </div>
              <InsightCard
                icon="ti-alert-triangle" tag="critical" tagLabel="Critical"
                title="Margaret Russo — portfolio drift + RMD"
                body="Tech overweight by <b>14%</b> after NVDA/MSFT run-up. April RMD may trigger an unnecessary taxable event. Estimated tax savings of <b>$18,400</b> if rebalanced now."
                actions={[
                  { label: 'Open client', onClick: () => nav('/clients/c001') },
                  { label: 'View portfolio', onClick: () => nav('/clients/c001') }
                ]}
              />
              <InsightCard
                icon="ti-building-bank" tag="practice" tagLabel="Practice goal"
                title="6 clients with idle cash — banking opportunity"
                body="Six clients hold <b>$840K combined</b> in external savings under 1%. Moves toward banking hurdle currently at <b>40% of target</b>."
                actions={[
                  { label: 'Show clients', onClick: () => nav('/clients') },
                ]}
              />
              <InsightCard
                icon="ti-calendar" tag="warning" tagLabel="Time-sensitive"
                title="Sandra & Tom Larkin — review window closing"
                body="Annual review is <b>13 months overdue</b>. Tom turns 73 in June — first RMD year. Last contact <b>34 days ago</b>."
                actions={[
                  { label: 'Open client', onClick: () => nav('/clients/c003') },
                  { label: 'View alerts', onClick: () => nav('/clients/c003') }
                ]}
              />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Overdue for contact</span>
                <button className="btn btn-sm" onClick={() => nav('/clients')}>All clients</button>
              </div>
              {(clients ?? []).filter(c => c.daysSinceContact > 14).slice(0, 5).map(c => (
                <div key={c.id} onClick={() => nav(`/clients/${c.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border-sm)', cursor: 'pointer' }}>
                  <Avatar initials={c.initials} color={c.color} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
                      {c.firstName}{c.spouseName ? ` & ${c.spouseName}` : ''} {c.lastName}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--subtle)' }}>Last contact {c.daysSinceContact} days ago</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fmt(c.aum)}</div>
                    <div style={{ fontSize: 10, color: c.daysSinceContact > 25 ? 'var(--danger)' : 'var(--warning)' }}>{c.daysSinceContact}d</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PRACTICE TAB ── */}
      {tab === 'practice' && practice && (
        <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
          {/* Stats */}
          <div style={{ gridColumn: '1/4', display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12 }}>
            <StatCard label="Comp pacing" value={fmt(practice.compensation.earned)} delta={`${practice.compensation.pct}% of ${fmt(practice.compensation.target)} target`} deltaDir="up" />
            <StatCard label="Fee-based AUM" value={fmt(practice.hurdles[1]?.current)} delta={`${practice.hurdles[1]?.pct}% of ${fmt(practice.hurdles[1]?.target)} hurdle`} deltaDir="neutral" />
            <StatCard label="New households" value={`${practice.hurdles[0]?.current} / ${practice.hurdles[0]?.target}`} delta="4 needed · 10 weeks left" deltaDir="down" />
            <StatCard label="Banking products" value={`${practice.hurdles[2]?.current} / ${practice.hurdles[2]?.target}`} delta="Most at-risk hurdle" deltaDir="down" />
          </div>

          {/* Hurdle chart */}
          <div className="card" style={{ gridColumn: '1/3' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Hurdle progress</span>
              <span className="section-label">2025 · 10 weeks remaining</span>
            </div>
            <HurdleChart hurdles={practice.hurdles} />
          </div>

          {/* Comp breakdown */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="ti ti-cash" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Comp by quarter</span>
            </div>
            {/* Ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <svg width="88" height="88" viewBox="0 0 88 88" role="img" aria-label={`Compensation ring: ${practice.compensation.pct}% complete`}>
                <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8"/>
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--accent)" strokeWidth="8"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * practice.compensation.pct / 100)}
                  strokeLinecap="round" transform="rotate(-90 44 44)"/>
                <text x="44" y="47" textAnchor="middle" fontSize="15" fontWeight="500" fill="rgba(255,255,255,0.88)">{practice.compensation.pct}%</text>
              </svg>
              <div>
                <div style={{ fontSize: 26, fontWeight: 500 }}>{fmt(practice.compensation.earned)}</div>
                <div style={{ fontSize: 12, color: 'var(--subtle)' }}>of {fmt(practice.compensation.target)}</div>
                <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 4 }}>↑ On track · proj. {fmt(practice.compensation.projection)}</div>
              </div>
            </div>
            {practice.compensation.quarterly.map(q => (
              <div key={q.quarter} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '0.5px solid var(--border-sm)' }}>
                <span style={{ color: 'var(--muted)' }}>{q.quarter}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                  {fmt(q.projected ?? q.earned)}
                  {q.projected && <span style={{ fontSize: 10, color: 'var(--success)', marginLeft: 4 }}>proj.</span>}
                </span>
              </div>
            ))}
          </div>

          {/* AI coaching */}
          <div className="card" style={{ gridColumn: '1/4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <i className="ti ti-cpu" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>AI coaching — highest-leverage moves</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
              {practice.hurdles.filter(h => h.aiNudge).map(h => (
                <InsightCard key={h.id}
                  icon={h.status === 'behind' ? 'ti-alert-triangle' : h.status === 'at-risk' ? 'ti-clock' : 'ti-check'}
                  tag={h.status === 'behind' ? 'critical' : 'warning'}
                  tagLabel={h.status === 'behind' ? 'Behind' : h.status === 'at-risk' ? 'At risk' : 'On track'}
                  title={`${h.name} (${h.pct}% of target)`}
                  body={h.aiNudge}
                  actions={[{ label: 'Get coaching', onClick: () => nav('/today') }]}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MARKETS TAB ── */}
      {tab === 'markets' && markets && (
        <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
          {/* Index stats */}
          <div style={{ gridColumn: '1/4', display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 12 }}>
            {markets.indices.map(idx => (
              <StatCard key={idx.symbol} label={idx.name}
                value={idx.isRate ? `${idx.price.toFixed(2)}%` : idx.price.toLocaleString()}
                delta={`${idx.direction === 'up' ? '↑' : '↓'} ${Math.abs(idx.changePct).toFixed(2)}% today`}
                deltaDir={idx.direction === 'up' ? 'up' : 'down'} />
            ))}
          </div>

          {/* Watchlist */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <i className="ti ti-star" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Watchlist</span>
            </div>
            {markets.watchlist.map(t => (
              <div key={t.symbol} style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid var(--border-sm)' }}>
                <span style={{ fontSize: 12, fontWeight: 500, width: 56, color: 'var(--text)' }}>{t.symbol}</span>
                <span style={{ fontSize: 11, flex: 1, color: 'var(--muted)' }}>{t.name}</span>
                {t.clientsHolding > 0 && (
                  <span className="badge badge-blue" style={{ marginRight: 8 }}>{t.clientsHolding} clients</span>
                )}
                <span style={{ fontSize: 12, color: 'var(--text)', width: 68, textAlign: 'right' }}>${t.price.toLocaleString()}</span>
                <span style={{ fontSize: 11, width: 52, textAlign: 'right', color: t.direction === 'up' ? 'var(--success)' : 'var(--danger)' }}>
                  {t.direction === 'up' ? '+' : ''}{t.changePct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* News */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <i className="ti ti-news" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Market news</span>
            </div>
            {markets.news.map(n => (
              <div key={n.id} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '0.5px solid var(--border-sm)', alignItems: 'flex-start' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  background: n.impact === 'positive' ? 'rgba(34,197,94,0.1)' : n.impact === 'negative' ? 'rgba(239,68,68,0.1)' : n.impact === 'action' ? 'rgba(245,158,11,0.1)' : 'rgba(29,78,216,0.1)',
                  color: n.impact === 'positive' ? '#4ade80' : n.impact === 'negative' ? '#f87171' : n.impact === 'action' ? '#fbbf24' : '#60a5fa'
                }}>
                  <i className={n.impact === 'positive' ? 'ti ti-trending-up' : n.impact === 'negative' ? 'ti ti-trending-down' : n.impact === 'action' ? 'ti ti-alert-triangle' : 'ti ti-building-bank'} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4, marginBottom: 3 }}>{n.headline}</div>
                  <div style={{ fontSize: 10, color: 'var(--subtle)' }}>{n.source} · {n.hoursAgo < 24 ? `${n.hoursAgo}h ago` : 'Yesterday'}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI client impact */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <i className="ti ti-cpu" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>AI — client impact alerts</span>
            </div>
            {markets.aiClientAlerts.map((a, i) => (
              <InsightCard key={i}
                icon={a.severity === 'alert' ? 'ti-alert-triangle' : 'ti-eye'}
                tag={a.severity === 'alert' ? 'critical' : 'warning'}
                tagLabel={a.severity === 'alert' ? 'Alert' : 'Watch'}
                title={a.title}
                body={a.body}
                actions={[{ label: a.action, onClick: () => nav('/clients') }]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
