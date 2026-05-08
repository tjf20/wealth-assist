import { Bar } from 'react-chartjs-2'

export default function AumChart({ history = [] }) {
  const labels = history.map(h => h.month)
  const aum    = history.map(h => parseFloat((h.aum / 1e6).toFixed(1)))
  const ret    = history.map(h => h.bookReturn)
  const bench  = history.map(h => h.benchmark)

  const data = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Book AUM ($M)',
        data: aum,
        backgroundColor: 'rgba(29,78,216,0.35)',
        borderColor: 'rgba(29,78,216,0.6)',
        borderWidth: 0.5,
        yAxisID: 'y',
        order: 2
      },
      {
        type: 'line',
        label: 'Book return %',
        data: ret,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.06)',
        borderWidth: 2,
        pointRadius: 2,
        pointBackgroundColor: '#22c55e',
        tension: 0.4,
        fill: true,
        yAxisID: 'y2',
        order: 1
      },
      {
        type: 'line',
        label: 'S&P 500 %',
        data: bench,
        borderColor: 'rgba(255,255,255,0.22)',
        borderWidth: 1.5,
        borderDash: [5, 4],
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        yAxisID: 'y2',
        order: 3
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1d24',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 0.5,
        titleColor: 'rgba(255,255,255,0.6)',
        bodyColor: 'rgba(255,255,255,0.8)',
        padding: 10
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
        grid:  { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        position: 'left',
        min: Math.floor(Math.min(...aum)) - 2,
        max: Math.ceil(Math.max(...aum)) + 2,
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, callback: v => `$${v}M` },
        grid:  { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.06)' }
      },
      y2: {
        position: 'right',
        min: 0, max: 10,
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, callback: v => `${v.toFixed(1)}%` },
        grid:  { display: false },
        border: { color: 'rgba(255,255,255,0.06)' }
      }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: 200 }}>
      <Bar data={data} options={options} role="img"
        aria-label={`AUM chart: $${aum[0]}M to $${aum[aum.length-1]}M, return ${ret[ret.length-1]}% vs ${bench[bench.length-1]}% benchmark`} />
    </div>
  )
}
