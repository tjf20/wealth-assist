import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClients } from '../hooks/useData.js'
import Avatar from '../components/shared/Avatar.jsx'

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n)

const ALERT_FILTERS = [
  { value: '',         label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'review',   label: 'Needs review' },
  { value: 'none',     label: 'Healthy' },
]

const DOT = { critical: 'dot-red', review: 'dot-amber', info: 'dot-blue', none: 'dot-none' }

export default function ClientsView() {
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const { data: clients, loading } = useClients(
    Object.fromEntries(Object.entries({ search, alert: filter }).filter(([,v]) => v))
  )

  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Clients</h1>
          <p style={{ fontSize: 12, color: 'var(--subtle)', margin: '3px 0 0' }}>
            {clients?.length ?? '—'} clients · Book of business
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
          <input className="wa-input" style={{ paddingLeft: 32 }}
            placeholder="Search clients…"
            value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {ALERT_FILTERS.map(f => (
            <button key={f.value}
              className={`btn btn-sm ${filter === f.value ? 'btn-primary' : ''}`}
              style={{ borderRadius: 20 }}
              onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client table */}
      {loading ? (
        <div style={{ color: 'var(--subtle)', fontSize: 13 }}>Loading clients…</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: 0, padding: '10px 20px', borderBottom: '0.5px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            {['Client', 'AUM', 'YTD Return', 'Mandate', 'Last Contact', 'Status'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 500, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
            ))}
          </div>

          {(clients ?? []).map((c, idx) => (
            <div key={c.id}
              onClick={() => nav(`/clients/${c.id}`)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
                gap: 0,
                padding: '12px 20px',
                borderBottom: idx < (clients.length - 1) ? '0.5px solid var(--border-sm)' : 'none',
                cursor: 'pointer',
                transition: 'background 0.1s',
                alignItems: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar initials={c.initials} color={c.color} size={32} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                    {c.firstName}{c.spouseName ? ` & ${c.spouseName}` : ''} {c.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--subtle)' }}>Client since {c.clientSince}</div>
                </div>
              </div>

              {/* AUM */}
              <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{fmt(c.aum)}</div>

              {/* YTD */}
              <div style={{ fontSize: 13, color: c.ytdReturn >= c.benchmarkReturn ? 'var(--success)' : 'var(--danger)' }}>
                {c.ytdReturn > 0 ? '+' : ''}{c.ytdReturn.toFixed(1)}%
              </div>

              {/* Mandate */}
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.mandate}</div>

              {/* Last contact */}
              <div style={{ fontSize: 12, color: c.daysSinceContact > 25 ? 'var(--danger)' : c.daysSinceContact > 14 ? 'var(--warning)' : 'var(--muted)' }}>
                {c.daysSinceContact}d ago
              </div>

              {/* Alert status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div className={`alert-dot ${DOT[c.alertLevel] || 'dot-none'}`} />
                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>
                  {c.alertLevel === 'none' ? 'Healthy' : c.alertLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
