import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClients, usePractice } from '../hooks/useData.js'
import { useAIChat, fetchPriorities } from '../hooks/useAI.js'
import StatCard from '../components/shared/StatCard.jsx'
import Avatar from '../components/shared/Avatar.jsx'
import AumChart from '../components/charts/AumChart.jsx'
import { BookHealthChart, HurdleChart } from '../components/charts/BookHealthChart.jsx'

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n)

const URGENCY_STYLE = {
  critical: { dot: '#ef4444', badge: 'badge-red',   label: 'Critical' },
  high:     { dot: '#f59e0b', badge: 'badge-amber',  label: 'High priority' },
  medium:   { dot: '#60a5fa', badge: 'badge-blue',   label: 'Action' },
}

export default function TodayView() {
  const nav = useNavigate()
  const { data: clients }  = useClients()
  const { data: practice } = usePractice()
  const [priorities, setPriorities] = useState([])
  const [loadingPri, setLoadingPri] = useState(true)
  const { messages, streaming, sendMessage } = useAIChat()
  const [chatInput, setChatInput]  = useState('')
  const [chatOpen, setChatOpen]    = useState(false)

  useEffect(() => {
    fetchPriorities()
      .then(d => setPriorities(d.priorities ?? []))
      .catch(() => setPriorities(FALLBACK_PRIORITIES))
      .finally(() => setLoadingPri(false))
  }, [])

  const todayMeetings = (clients ?? []).filter(c => c.meetings?.length > 0).flatMap(c =>
    c.meetings.filter(m => m.date === new Date().toISOString().slice(0,10)).map(m => ({ ...m, client: c }))
  )

  const handleSend = () => {
    if (!chatInput.trim()) return
    sendMessage(chatInput)
    setChatInput('')
    setChatOpen(true)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 50px)' }}>
      {/* AI Morning Brief */}
      <div style={{ background: '#0b0d12', borderBottom: '0.5px solid rgba(29,78,216,0.2)', padding: '14px 32px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-muted)', border: '0.5px solid rgba(29,78,216,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="ti ti-cpu" style={{ fontSize: 18, color: 'var(--accent-light)' }} aria-hidden="true" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>AI morning briefing</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            Good morning, James. I reviewed your book overnight.{' '}
            <strong style={{ color: 'var(--text)' }}>Your top priority today is Margaret Russo</strong>
            {' '}— her tech overweight crossed a rebalance threshold and her RMD window is tightening.
            You have <strong style={{ color: 'var(--text)' }}>{todayMeetings.length} meetings needing prep</strong>,
            and your banking hurdle is the biggest comp risk with 10 weeks left.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'flex-start' }}>
          <button className="btn btn-primary" onClick={() => { setChatInput('Draft my client outreach plan for this week based on today\'s priorities'); setChatOpen(true); }}>
            <i className="ti ti-send" style={{ fontSize: 12 }} aria-hidden="true" /> Draft outreach plan ↗
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Priorities */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-list-check" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Today's priorities</span>
                <span style={{ fontSize: 11, color: 'var(--subtle)' }}>AI-ranked</span>
              </div>
            </div>

            {loadingPri ? (
              <div style={{ color: 'var(--subtle)', fontSize: 12, padding: '20px 0' }}>
                <i className="ti ti-loader" style={{ marginRight: 6 }} aria-hidden="true" />
                AI is ranking your priorities...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {priorities.map((p, i) => {
                  const sty = URGENCY_STYLE[p.urgency] || URGENCY_STYLE.medium
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px', borderRadius: 9,
                      border: '0.5px solid var(--border)',
                      background: 'rgba(255,255,255,0.02)', cursor: 'default'
                    }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${sty.dot}22`, color: sty.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0, marginTop: 1 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{p.description}</div>
                        {p.estimatedImpact && (
                          <div style={{ fontSize: 10, color: 'var(--success)', marginTop: 3 }}>Est. impact: {p.estimatedImpact}</div>
                        )}
                        <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
                          <button className="btn btn-sm btn-primary"
                            onClick={() => { setChatInput(p.primaryPrompt); handleSend(); }}>
                            {p.primaryAction} ↗
                          </button>
                          {p.category === 'client' && (
                            <button className="btn btn-sm" onClick={() => nav('/clients')}>
                              View client
                            </button>
                          )}
                        </div>
                      </div>
                      <span className={`badge ${sty.badge}`}>{sty.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Book + Hurdles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Book health</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                {[['#22c55e','Healthy'],['#f59e0b','Review'],['#ef4444','At risk']].map(([c,l]) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                  </span>
                ))}
              </div>
              <BookHealthChart segments={practice?.bookHealth?.segments ?? []} />
            </div>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Practice hurdles</span>
                <button className="btn btn-sm btn-primary" onClick={() => nav('/')}>Coach me ↗</button>
              </div>
              <HurdleChart hurdles={practice?.hurdles ?? []} />
            </div>
          </div>

          {/* AUM chart */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>AUM performance — 12-month rolling</span>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(29,78,216,0.55)', display: 'inline-block' }} />AUM ($M)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />Book %
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'inline-block' }} />S&P 500 %
                </span>
              </div>
            </div>
            <AumChart history={practice?.bookHealth?.aumHistory ?? []} />
          </div>
        </div>

        {/* Right column: meetings + AI chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Meetings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <i className="ti ti-calendar-event" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Meeting prep</span>
              <span className="badge badge-blue">{todayMeetings.length} today</span>
            </div>
            {todayMeetings.length === 0 && (
              <p style={{ color: 'var(--subtle)', fontSize: 12 }}>No meetings scheduled for today.</p>
            )}
            {todayMeetings.map(m => (
              <div key={m.id} style={{ border: '0.5px solid var(--border)', borderRadius: 9, padding: '12px 14px', marginBottom: 10, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Avatar initials={m.client.initials} color={m.client.color} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{m.client.firstName}{m.client.spouseName ? ` & ${m.client.spouseName}` : ''} {m.client.lastName}</div>
                    <div style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 1 }}>
                      <i className="ti ti-clock" style={{ fontSize: 11, marginRight: 3 }} aria-hidden="true" />
                      {m.time} · {m.duration} min · {m.type}
                    </div>
                  </div>
                  <span className={`badge ${m.format === 'zoom' ? 'badge-blue' : 'badge-green'}`}>
                    {m.format === 'zoom' ? 'Zoom' : 'In person'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, padding: '8px 10px', background: 'rgba(29,78,216,0.05)', borderRadius: 6, border: '0.5px solid rgba(29,78,216,0.12)', marginBottom: 8 }}>
                  <strong style={{ color: 'var(--muted)' }}>AI context: </strong>{m.client.notes?.slice(0, 120)}…
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-primary"
                    onClick={() => { sendMessage(`Build a full meeting brief and agenda for ${m.client.firstName} ${m.client.lastName}'s ${m.type} today, including portfolio summary and key talking points.`); setChatOpen(true) }}>
                    Full brief ↗
                  </button>
                  <button className="btn btn-sm" onClick={() => nav(`/clients/${m.client.id}`)}>Open client</button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Chat panel */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <i className="ti ti-message-circle" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Ask AI</span>
              {streaming && <span className="badge badge-purple">Thinking…</span>}
            </div>

            {/* Messages */}
            <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {messages.length === 0 && (
                <div style={{ color: 'var(--subtle)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                  Ask anything about your book, clients, or today's priorities
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.6,
                  background: m.role === 'user' ? 'rgba(29,78,216,0.12)' : 'rgba(255,255,255,0.03)',
                  color: m.role === 'user' ? 'var(--accent-light)' : 'var(--text)',
                  border: `0.5px solid ${m.role === 'user' ? 'rgba(29,78,216,0.25)' : 'var(--border)'}`,
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  whiteSpace: 'pre-wrap'
                }} className={i === messages.length - 1 && streaming ? 'streaming-cursor' : ''}>
                  {m.content}
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="wa-input"
                style={{ flex: 1 }}
                placeholder="Ask about your book or any client…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <button className="btn btn-primary"
                onClick={handleSend}
                disabled={streaming || !chatInput.trim()}
                style={{ flexShrink: 0 }}>
                <i className="ti ti-arrow-up" style={{ fontSize: 14 }} aria-hidden="true" />
              </button>
            </div>

            {/* Quick prompts */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {[
                'What should I focus on today?',
                'Which clients are most at risk?',
                'Draft banking outreach emails',
              ].map(q => (
                <button key={q} className="btn btn-sm"
                  onClick={() => { setChatInput(q); }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const FALLBACK_PRIORITIES = [
  { rank: 1, title: 'Call Margaret Russo — rebalance + RMD planning', description: 'Tech position is 14% overweight. April RMD is 11 weeks out. Estimated client savings: $18,400.', urgency: 'critical', category: 'client', primaryAction: 'Run analysis', primaryPrompt: 'Run a full rebalance and tax impact analysis for Margaret Russo' },
  { rank: 2, title: 'Meeting prep — Carol & Neil Foster · 10:00 am', description: 'Estate planning review. Trust was last updated 4 years ago. NVDA up 38% since last review.', urgency: 'high', category: 'meeting', primaryAction: 'Build meeting brief', primaryPrompt: 'Build a full meeting brief for Carol and Neil Foster estate planning review' },
  { rank: 3, title: 'Banking outreach — 6 clients with idle cash', description: 'AI identified $840K in external savings earning under 1%. Banking hurdle at 40% with 10 weeks left.', urgency: 'medium', category: 'practice', primaryAction: 'Draft outreach emails', primaryPrompt: 'Draft personalized HYSA outreach emails for clients with idle external cash' },
]
