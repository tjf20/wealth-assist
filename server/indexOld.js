import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import clientsRouter from './routes/clients.js'
import practiceRouter from './routes/practice.js'
import marketsRouter from './routes/markets.js'
import reportsRouter from './routes/reports.js'
import aiRouter from './routes/ai.js'

dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/clients', clientsRouter)
app.use('/api/practice', practiceRouter)
app.use('/api/markets', marketsRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/ai', aiRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`\n🚀 Wealth Assistant API running on http://localhost:${PORT}`)
  console.log(`   Claude API: ${process.env.ANTHROPIC_API_KEY ? '✓ configured' : '✗ missing ANTHROPIC_API_KEY'}`)
})
