import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

const getClients = () =>
  JSON.parse(readFileSync(join(__dirname, '../data/clients.json'), 'utf8'))

// GET /api/clients
router.get('/', (req, res) => {
  const clients = getClients()
  const { alert, search } = req.query
  let filtered = clients
  if (alert) filtered = filtered.filter(c => c.alertLevel === alert)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.spouseName && c.spouseName.toLowerCase().includes(q))
    )
  }
  // Strip heavy holdings/aumHistory for list view
  const slim = filtered.map(({ holdings, aumHistory, ...c }) => c)
  res.json(slim)
})

// GET /api/clients/:id
router.get('/:id', (req, res) => {
  const clients = getClients()
  const client = clients.find(c => c.id === req.params.id)
  if (!client) return res.status(404).json({ error: 'Client not found' })
  res.json(client)
})

// GET /api/clients/:id/summary — lean AI context payload
router.get('/:id/summary', (req, res) => {
  const clients = getClients()
  const client = clients.find(c => c.id === req.params.id)
  if (!client) return res.status(404).json({ error: 'Client not found' })
  const summary = {
    name: `${client.firstName} ${client.spouseName ? '& ' + client.spouseName + ' ' : ''}${client.lastName}`,
    aum: client.aum,
    mandate: client.mandate,
    riskProfile: client.riskProfile,
    clientSince: client.clientSince,
    ytdReturn: client.ytdReturn,
    benchmarkReturn: client.benchmarkReturn,
    alerts: client.alerts,
    bankingProducts: client.bankingProducts,
    externalCash: client.externalCash,
    accounts: client.accounts,
    topHoldings: client.holdings?.slice(0, 5),
    notes: client.notes,
    tags: client.tags
  }
  res.json(summary)
})

export default router
