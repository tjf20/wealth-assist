import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import clientsRouter from './routes/clients.js'
import practiceRouter from './routes/practice.js'
import marketsRouter from './routes/markets.js'
import reportsRouter from './routes/reports.js'
import aiRouter from './routes/ai.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env in development — Azure injects env vars directly in production
if (process.env.NODE_ENV !== 'production') {
  const envPath = join(__dirname, '../.env')
  const found = existsSync(envPath)
  console.log(`[dotenv] Looking for .env at: ${envPath}`)
  console.log(`[dotenv] File found: ${found}`)
  if (found) {
    const result = dotenv.config({ path: envPath })
    console.log(`[dotenv] Loaded OK: ${!result.error}`)
  }
  console.log(`[dotenv] ANTHROPIC_API_KEY set: ${!!process.env.ANTHROPIC_API_KEY}`)
}

const isProd = process.env.NODE_ENV === 'production'
const app = express()
const PORT = process.env.PORT || 3001

if (!isProd) {
  app.use(cors({ origin: 'http://localhost:5173' }))
}

app.use(express.json())

app.use('/api/clients',  clientsRouter)
app.use('/api/practice', practiceRouter)
app.use('/api/markets',  marketsRouter)
app.use('/api/reports',  reportsRouter)
app.use('/api/ai',       aiRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

if (isProd) {
  const distPath = join(__dirname, '../client/dist')
  if (existsSync(distPath)) {
    app.use(express.static(distPath))
    app.get('*', (req, res) => {
      res.sendFile(join(distPath, 'index.html'))
    })
  } else {
    console.warn('No client/dist found — run: cd client && npm run build')
  }
}

app.listen(PORT, () => {
  console.log(`\n Wealth Assistant running on http://localhost:${PORT}`)
  console.log(`   Mode:       ${isProd ? 'production' : 'development'}`)
  console.log(`   Claude API: ${process.env.ANTHROPIC_API_KEY ? 'configured' : 'MISSING'}`)
})
