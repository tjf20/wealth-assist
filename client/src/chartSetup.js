import { Chart, registerables } from 'chart.js'

// Register ALL Chart.js components — prevents tree-shaking from
// dropping controllers needed for mixed bar/line charts in production
Chart.register(...registerables)
