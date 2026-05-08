import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useClient } from '../hooks/useData.js'
import { useAIChat } from '../hooks/useAI.js'
import Avatar from '../components/shared/Avatar.jsx'
import InsightCard from '../components/shared/InsightCard.jsx'
import StatCard from '../components/shared/StatCard.jsx'

const fmt  = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtC = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n)

export default function ClientDetailView() {
  const { id } = useParams()
  const nav    = useNavigate()
  const { data: client, loading } = useClient(id)
  const { messages, streaming, sendMessage } = useAIChat()
  const [chatInput, setChatInput] = useState('')
  const [activeTab, setActiveTab] = useState('insights')

  if (loading) return <div style={{ padding: 32, color: 'var(--subtle)' }}>Loading client…</div>
  if (!client) return <div style={{ padding: 32, color: 'var(--danger)' }}>Client not found.</div>

  const fullName = `${client.firstName}${client.spouseName ? ' & ' + client.spouseName : ''} ${client.lastName}`
  const clientContext = {
    name: fullName, aum: client.aum, mandate: client.mandate,
    riskProfile: client.riskProfile, ytdReturn: client.ytdReturn,
    alerts: client.alerts, bankingProducts: client.bankingProducts,
    externalCash: client.externalCash, notes: client.notes, tags: client.tags,
    accounts: client.accounts, holdings: client.holdings?.slice(0, 5)
  }

  const handleSend = () => {
    if (!chatInput.trim()) return
    sendMessage(chatInput, clientContext)
    setChatInput('')
  }

  const TABS = ['insights', 'holdings', 'accounts', 'activity']

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '12px 32px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--subtle)' }}>
        <span style={{ cursor: 'pointer', color: 'var(--accent-light)' }} onClick={() => nav('/clients')}>Clients</span>
        <i className="ti ti-chevron-right" style={{ fontSize: 12 }} aria-hidden="true" />
        <span>{fullName}</span>
      </div>

      {/* Client header */}
      <div style={{ padding: '16px 32px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--nav)' }}>
        <Avatar initials={client.initials} color={client.color} size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)' }}>{fullName}</div>
          <div style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 3 }}>
            {client.mandate} · Client since {client.clientSince} · Last contact {client.daysSinceContact} days ago
            {client.bankingProducts.length === 0 && ' · '}
            {client.bankingProducts.length === 0 && <span style={{ color: 'var(--danger)' }}>No banking products</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn"><i className="ti ti-phone" style={{ fontSize: 13 }} aria-hidden="true" /> Call</button>
          <button className="btn"><i className="ti ti-mail" style={{ fontSize: 13 }} aria-hidden="true" /> Email</button>
          <button className="btn"><i className="ti ti-calendar-plus" style={{ fontSize: 13 }} aria-hidden="true" /> Schedule</button>
          <button className="btn btn-primary"
            onClick={() => { sendMessage(`Build a complete meeting brief and talking points for ${fullName}`, clientContext); }}>
            <i className="ti ti-cpu" style={{ fontSize: 13 }} aria-hidden="true" /> AI brief ↗
          </button>
        </div>
      </div>

      {/* Alert strip */}
      {client.alerts.filter(a => a.severity === 'critical').map((a, i) => (
        <div key={i} style={{ background: 'rgba(239,68,68,0.06)', borderBottom: '0.5px solid rgba(239,68,68,0.14)', padding: '9px 32px', display: 'flex', alignItems: 'flex-start', gap: 9 }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: 14, color: 'var(--danger)', marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--danger)' }}>AI alert: </strong>{a.message}
            {a.estimatedSavings && <span style={{ color: 'var(--success)', marginLeft: 6 }}>Est. savings: {fmt(a.estimatedSavings)}</span>}
          </span>
        </div>
      ))}

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 1, borderBottom: '0.5px solid var(--border)' }}>
        {[
          { label: 'Total AUM', value: fmtC(client.aum), delta: `↑ ${((client.ytdReturn/100)*client.aum).toLocaleString('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:0})} YTD`, dir: 'up' },
          { label: 'YTD Return', value: `+${client.ytdReturn.toFixed(1)}%`, delta: `vs +${client.benchmarkReturn.toFixed(1)}% benchmark`, dir: 'up' },
          { label: 'Cash position', value: `${client.cashPosition.toFixed(1)}%`, delta: 'Of portfolio', dir: 'neutral' },
          { label: 'Risk profile', value: client.riskProfile, delta: client.riskDrift === 'above' ? '↑ Drifted above target' : client.riskDrift === 'below' ? '↓ Drifted below' : 'On target', dir: client.riskDrift !== 'on-target' ? 'down' : 'up' },
          { label: 'Banking products', value: client.bankingProducts.length === 0 ? 'None' : client.bankingProducts.length.toString(), delta: client.bankingProducts.length === 0 ? 'Opportunity' : client.bankingProducts.join(', '), dir: client.bankingProducts.length === 0 ? 'down' : 'up' },
        ].map(m => (
          <div key={m.label} style={{ padding: '12px 18px', background: '#0b0d12' }}>
            <div style={{ fontSize: 10, color: 'var(--subtle)', marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: m.label === 'Banking products' && client.bankingProducts.length === 0 ? 'var(--danger)' : 'var(--text)' }}>{m.value}</div>
            <div style={{ fontSize: 10, marginTop: 2, color: m.dir === 'up' ? 'var(--success)' : m.dir === 'down' ? 'var(--danger)' : 'var(--subtle)' }}>{m.delta}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,340px)', gap: 0, minHeight: 500 }}>
        {/* Left: tabs */}
        <div style={{ borderRight: '0.5px solid var(--border)' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '0.5px solid var(--border)', padding: '0 24px' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                height: 40, padding: '0 16px', fontSize: 12, fontWeight: 500,
                color: activeTab === t ? 'var(--text)' : 'var(--subtle)',
                background: 'transparent', border: 'none',
                borderBottom: activeTab === t ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize'
              }}>{t}</button>
            ))}
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Insights tab */}
            {activeTab === 'insights' && (
              <div>
                <div className="section-label" style={{ marginBottom: 12 }}>Proactive insights</div>
                {client.alerts.map((a, i) => (
                  <InsightCard key={i}
                    icon={a.type === 'rebalance' ? 'ti-cpu' : a.type === 'rmd' ? 'ti-clock' : a.type === 'contact' ? 'ti-calendar' : 'ti-building-bank'}
                    tag={a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info'}
                    tagLabel={a.severity === 'critical' ? 'Critical' : a.severity === 'warning' ? 'Attention' : 'Info'}
                    title={a.type === 'rebalance' ? 'Rebalancing opportunity' : a.type === 'rmd' ? 'RMD planning' : a.type === 'contact' ? 'Contact overdue' : 'Banking opportunity'}
                    body={a.message + (a.estimatedSavings ? ` <b>Est. savings: ${fmt(a.estimatedSavings)}</b>` : '')}
                    actions={[
                      { label: 'Ask AI', onClick: () => sendMessage(`Help me address this for ${fullName}: ${a.message}`, clientContext) },
                      { label: 'Dismiss', onClick: () => {} }
                    ]}
                  />
                ))}
                {client.externalCash > 0 && (
                  <InsightCard
                    icon="ti-building-bank" tag="practice" tagLabel="Practice goal"
                    title="Banking relationship gap"
                    body={`${fullName} has <b>${fmt(client.externalCash)}</b> in external savings earning ~0.5%. Moving to HYSA at 4.8% saves them money and counts toward your banking hurdle.`}
                    actions={[
                      { label: 'Prepare banking proposal', onClick: () => sendMessage(`Draft a banking proposal for ${fullName} to move ${fmt(client.externalCash)} from external savings to our HYSA`, clientContext) }
                    ]}
                  />
                )}
                <InsightCard
                  icon="ti-notes" tag="info" tagLabel="Context"
                  title="Advisor notes"
                  body={client.notes}
                  actions={[]}
                />
              </div>
            )}

            {/* Holdings tab */}
            {activeTab === 'holdings' && (
              <div>
                <div className="section-label" style={{ marginBottom: 12 }}>Portfolio holdings</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Ticker', 'Name', 'Value', 'Allocation', 'Target', 'Drift'].map(h => (
                          <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 12px', borderBottom: '0.5px solid var(--border)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(client.holdings ?? []).map(h => (
                        <tr key={h.ticker} style={{ borderBottom: '0.5px solid var(--border-sm)' }}>
                          <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{h.ticker}</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--muted)' }}>{h.name}</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text)' }}>{fmt(h.value)}</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text)' }}>{h.allocation.toFixed(1)}%</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--subtle)' }}>{h.targetAllocation.toFixed(1)}%</td>
                          <td style={{ padding: '10px 12px', fontSize: 12,
                            color: Math.abs(h.drift) < 1 ? 'var(--success)' : h.drift > 0 ? 'var(--danger)' : 'var(--warning)' }}>
                            {h.drift > 0 ? '+' : ''}{h.drift.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Accounts tab */}
            {activeTab === 'accounts' && (
              <div>
                <div className="section-label" style={{ marginBottom: 12 }}>Accounts</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
                  {(client.accounts ?? []).map(acc => (
                    <div key={acc.id} style={{ border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{acc.type}</span>
                        {acc.feeBased
                          ? <span className="badge badge-green">Fee-based</span>
                          : <span className="badge badge-gray">Commission</span>}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{fmt(acc.value)}</div>
                      <div style={{ fontSize: 11, color: 'var(--subtle)' }}>{acc.custodian}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity tab */}
            {activeTab === 'activity' && (
              <div>
                <div className="section-label" style={{ marginBottom: 12 }}>Recent activity</div>
                <div style={{ color: 'var(--subtle)', fontSize: 12 }}>
                  Activity timeline will pull from Salesforce / CRM integration.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI chat */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-message-circle" style={{ fontSize: 14, color: 'var(--subtle)' }} aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Ask about {client.firstName}</span>
            {streaming && <span className="badge badge-purple">Thinking…</span>}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480 }}>
            {messages.length === 0 && (
              <div style={{ color: 'var(--subtle)', fontSize: 12, textAlign: 'center', paddingTop: 24 }}>
                Ask anything about {fullName}'s portfolio, risks, or opportunities
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

          {/* Quick prompts */}
          <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: '0.5px solid var(--border)' }}>
            {[
              `What's her biggest risk right now?`,
              'Draft a rebalancing rationale',
              'Write a check-in email',
              'Summarize her portfolio',
            ].map(q => (
              <button key={q} className="btn btn-sm"
                onClick={() => { sendMessage(q, clientContext) }}
                style={{ fontSize: 10 }}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 16px', borderTop: '0.5px solid var(--border)', display: 'flex', gap: 8 }}>
            <input className="wa-input" style={{ flex: 1 }}
              placeholder={`Ask about ${client.firstName}…`}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button className="btn btn-primary" onClick={handleSend} disabled={streaming || !chatInput.trim()}>
              <i className="ti ti-arrow-up" style={{ fontSize: 14 }} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
