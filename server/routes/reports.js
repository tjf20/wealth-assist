import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

const getReports = () =>
  JSON.parse(readFileSync(join(__dirname, '../data/reports.json'), 'utf8'))

router.get('/', (req, res) => {
  const reports = getReports()
  const { clientId, type } = req.query
  let filtered = reports
  if (clientId) filtered = filtered.filter(r => r.clientId === clientId)
  if (type) filtered = filtered.filter(r => r.type === type)
  res.json(filtered)
})

router.get('/:id', (req, res) => {
  const reports = getReports()
  const report = reports.find(r => r.id === req.params.id)
  if (!report) return res.status(404).json({ error: 'Report not found' })
  res.json(report)
})

export default router
