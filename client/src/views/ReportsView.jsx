import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReports } from '../hooks/useData.js'
import { useAIChat } from '../hooks/useAI.js'

const REPORT_TYPES = ['All', 'Performance', 'Meeting Brief', 'Tax Planning', 'Book Analysis', 'Proposal', 'Opportunity']

const TYPE_BADGE = {
  'Performance':    'badge-blue',
  'Meeting Brief':  'badge-purple',
  'Tax Planning':   'badge-amber',
  'Book Analysis':  'badge-green',
  'Proposal':       'badge-teal',
  'Opportunity':    'badge-amber',
}

const STATUS_BADGE = { final: 'badge-green', draft: 'badge-gray' }

export default function ReportsView() {
  const nav = useNavigate()
  const [typeFilter, setTypeFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genPrompt, setGenPrompt] = useState('')
  const { messages, streaming, sendMessage } = useAIChat()

  const { data: reports, loading } = useReports(
    typeFilter !== 'All' ? { type: typeFilter } : {}
  )

  const filtered = (reports ?? []).filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.title.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q)
  })

  const handleGenerate = () => {
    if (!genPrompt.trim()) return
    setGenerating(true)
    sendMessage(`Generate a report: ${genPrompt}. Format it professionally with sections, specific data points, and actionable recommendations.`)
    setGenPrompt('')
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', margin: 0 }}>Reports</h1>
          <p style={{ fontSize: 12, color: 'var(--subtle)', margin: '3px 0 0' }}>AI-generated reports and analyses saved to your library</p>
        </div>
        <button className="btn btn-primary" onClick={() => setGenerating(true)}>
          <i className="ti ti-plus" style={{ fontSize: 13 }} aria-hidden="true" /> Generate new report ↗
        </button>
      </div>

      {/* Generate panel */}
      {generating && (
        <div className="card" style={{ marginBottom: 20, border: '0.5px solid rgba(29,78,216,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <i className="ti ti-cpu" style={{ fontSize: 14, color: 'var(--accent-light)' }} aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Generate new report</span>
            {streaming && <span className="badge badge-purple">Writing…</span>}
          </div>

          {messages.length === 0 ? (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {[
                  'Q2 2026 performance summary for all clients',
                  'Banking opportunity analysis across book',
                  'Year-end RMD planning report for at-risk clients',
                  'Fee-based conversion opportunity summary',
                ].map(q => (
                  <button key={q} className="btn btn-sm" onClick={() => setGenPrompt(q)}>{q}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="wa-input" style={{ flex: 1 }}
                  placeholder="Describe the report you want to generate…"
                  value={genPrompt}
                  onChange={e => setGenPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
                <button className="btn btn-primary" onClick={handleGenerate} disabled={!genPrompt.trim()}>
                  Generate ↗
                </button>
                <button className="btn" onClick={() => setGenerating(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: 8, fontSize: 12, lineHeight: 1.7,
                  background: m.role === 'user' ? 'rgba(29,78,216,0.1)' : 'rgba(255,255,255,0.03)',
                  color: m.role === 'user' ? 'var(--accent-light)' : 'var(--text)',
                  border: `0.5px solid ${m.role === 'user' ? 'rgba(29,78,216,0.2)' : 'var(--border)'}`,
                  whiteSpace: 'pre-wrap'
                }} className={i === messages.length - 1 && streaming ? 'streaming-cursor' : ''}>
                  {m.content}
                </div>
              ))}
            </div>
          )}
          {messages.length > 0 && !streaming && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-primary"><i className="ti ti-download" style={{ fontSize: 12 }} aria-hidden="true" /> Save to library</button>
              <button className="btn" onClick={() => { setGenerating(false) }}>Done</button>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
          <input className="wa-input" style={{ paddingLeft: 32 }}
            placeholder="Search reports…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {REPORT_TYPES.map(t => (
            <button key={t} className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : ''}`}
              style={{ borderRadius: 20 }}
              onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Reports grid */}
      {loading ? (
        <div style={{ color: 'var(--subtle)', fontSize: 13 }}>Loading reports…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(29,78,216,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ti ti-file-analytics" style={{ fontSize: 15, color: 'var(--accent-light)' }} aria-hidden="true" />
                  </div>
                  <span className={`badge ${TYPE_BADGE[r.type] || 'badge-gray'}`}>{r.type}</span>
                </div>
                <span className={`badge ${STATUS_BADGE[r.status] || 'badge-gray'}`}>{r.status}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 6 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: 'var(--subtle)', marginBottom: 12 }}>
                {r.clientName} · {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm btn-primary">
                  <i className="ti ti-eye" style={{ fontSize: 12 }} aria-hidden="true" /> View
                </button>
                <button className="btn btn-sm">
                  <i className="ti ti-download" style={{ fontSize: 12 }} aria-hidden="true" /> Export
                </button>
                {r.clientId && (
                  <button className="btn btn-sm" onClick={e => { e.stopPropagation(); nav(`/clients/${r.clientId}`) }}>
                    <i className="ti ti-user" style={{ fontSize: 12 }} aria-hidden="true" /> Client
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/4', textAlign: 'center', color: 'var(--subtle)', fontSize: 13, padding: '40px 0' }}>
              No reports found. Generate your first one above.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
