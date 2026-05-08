const TAG_STYLES = {
  ai:       'badge-purple',
  critical: 'badge-red',
  warning:  'badge-amber',
  action:   'badge-blue',
  practice: 'badge-amber',
  info:     'badge-gray',
  success:  'badge-green',
}

export default function InsightCard({ icon, title, tag, tagLabel, body, actions = [] }) {
  return (
    <div className="insight-card" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 14, color: 'var(--purple)' }} aria-hidden="true" />
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{title}</span>
        {tag && (
          <span className={`badge ${TAG_STYLES[tag] || 'badge-gray'}`} style={{ marginLeft: 'auto' }}>
            {tagLabel}
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}
        dangerouslySetInnerHTML={{ __html: body }} />
      {actions.length > 0 && (
        <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
          {actions.map((a, i) => (
            <button key={i}
              className={`btn btn-sm ${i === 0 ? 'btn-primary' : ''}`}
              onClick={a.onClick}>
              {a.label} {i === 0 ? '↗' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
