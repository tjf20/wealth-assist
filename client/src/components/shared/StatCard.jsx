export default function StatCard({ label, value, delta, deltaDir }) {
  const deltaColor = deltaDir === 'up' ? 'var(--success)' : deltaDir === 'down' ? 'var(--danger)' : 'var(--subtle)'
  return (
    <div className="stat-cell">
      <div style={{ fontSize: 10, color: 'var(--subtle)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)' }}>{value}</div>
      {delta && (
        <div style={{ fontSize: 10, marginTop: 3, color: deltaColor }}>{delta}</div>
      )}
    </div>
  )
}
