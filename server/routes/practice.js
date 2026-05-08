import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

router.get('/', (req, res) => {
  const data = JSON.parse(readFileSync(join(__dirname, '../data/practice.json'), 'utf8'))
  res.json(data)
})

export default router
