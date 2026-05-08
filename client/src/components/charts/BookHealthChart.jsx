import { Bar } from 'react-chartjs-2'

export function BookHealthChart({ segments = [] }) {
  const data = {
    labels: segments.map(s => s.name),
    datasets: [
      { label: 'Healthy',      data: segments.map(s => s.healthy), backgroundColor: 'rgba(34,197,94,0.55)',  borderColor: 'rgba(34,197,94,0.8)',  borderWidth: 0.5 },
      { label: 'Needs review', data: segments.map(s => s.review),  backgroundColor: 'rgba(245,158,11,0.55)', borderColor: 'rgba(245,158,11,0.8)', borderWidth: 0.5 },
      { label: 'At risk',      data: segments.map(s => s.atRisk),  backgroundColor: 'rgba(239,68,68,0.55)',  borderColor: 'rgba(239,68,68,0.8)',  borderWidth: 0.5 }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1a1d24', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 0.5, titleColor: 'rgba(255,255,255,0.6)', bodyColor: 'rgba(255,255,255,0.8)', padding: 10 }
    },
    scales: {
      x: { stacked: true, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'rgba(255,255,255,0.06)' } },
      y: { stacked: true, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'rgba(255,255,255,0.06)' } }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: 180 }}>
      <Bar data={data} options={options} role="img" aria-label="Book health by segment" />
    </div>
  )
}

export function HurdleChart({ hurdles = [] }) {
  const colors = hurdles.map(h =>
    h.status === 'complete' || h.pct >= 85 ? 'rgba(34,197,94,0.55)' :
    h.pct >= 60 ? 'rgba(245,158,11,0.55)' : 'rgba(239,68,68,0.6)'
  )
  const borderColors = hurdles.map(h =>
    h.status === 'complete' || h.pct >= 85 ? 'rgba(34,197,94,0.8)' :
    h.pct >= 60 ? 'rgba(245,158,11,0.8)' : 'rgba(239,68,68,0.9)'
  )

  const data = {
    labels: hurdles.map(h => h.name),
    datasets: [{ label: 'Progress %', data: hurdles.map(h => h.pct), backgroundColor: colors, borderColor: borderColors, borderWidth: 0.5, borderRadius: 3 }]
  }

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1a1d24', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 0.5, titleColor: 'rgba(255,255,255,0.6)', bodyColor: 'rgba(255,255,255,0.8)', padding: 10, callbacks: { label: c => ` ${c.raw}% complete` } }
    },
    scales: {
      x: { min: 0, max: 100, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, callback: v => `${v}%` }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'rgba(255,255,255,0.06)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 11 } }, grid: { display: false }, border: { color: 'rgba(255,255,255,0.06)' } }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: hurdles.length * 36 + 40 }}>
      <Bar data={data} options={options} role="img" aria-label="Hurdle progress chart" />
    </div>
  )
}
