import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

// Lazy — created on first request so dotenv has already run
let _client = null
function getClient() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set. Add it to your .env file.')
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

const SYSTEM_PROMPT = `You are Wealth Assistant — an AI advisor intelligence platform for James Whitfield, a Senior Financial Advisor at a major brokerage firm. James manages 47 clients with $68.4M AUM.

Your role:
- Analyze client portfolios, flag risks, and surface opportunities
- Help draft client communications (emails, meeting agendas, talking points)
- Provide practice management coaching on hurdles and compensation
- Interpret market events in the context of specific client holdings
- Always be specific — reference client names, dollar amounts, percentages

Communication style:
- Concise and professional — FAs are busy
- Lead with the most actionable insight
- When drafting client communications, keep them warm but brief
- Never use jargon without explanation
- Format longer responses with clear sections

Compliance guardrails:
- Do not make specific buy/sell recommendations without noting they require advisor judgment
- Note that all analysis is for advisor use, not direct client distribution, unless specified
- Flag when a situation may require compliance review

Context about James's current priorities:
- Banking products hurdle is most at-risk (40% of target, 10 weeks left)
- 3 clients have critical alerts (Margaret Russo, Sandra & Tom Larkin, and others)
- 2 meetings today: Carol & Neil Foster (10am estate review) and David Kim (2:30pm portfolio)
- Book is performing well at +6.8% YTD vs +5.1% benchmark`

// POST /api/ai/chat — general chat with optional client context
router.post('/chat', async (req, res) => {
  const { messages, clientContext } = req.body

  if (!messages?.length) {
    return res.status(400).json({ error: 'messages array required' })
  }

  const systemWithContext = clientContext
    ? `${SYSTEM_PROMPT}\n\nCurrent client context:\n${JSON.stringify(clientContext, null, 2)}`
    : SYSTEM_PROMPT

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const stream = await getClient().messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemWithContext,
      messages
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Claude API error:', err)
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
    res.end()
  }
})

// POST /api/ai/brief — generate a structured client brief (non-streaming)
router.post('/brief', async (req, res) => {
  const { clientId, briefType } = req.body

  let clientData = null
  try {
    const clients = JSON.parse(readFileSync(join(__dirname, '../data/clients.json'), 'utf8'))
    clientData = clients.find(c => c.id === clientId)
  } catch {}

  const prompt = `Generate a ${briefType || 'meeting'} brief for ${clientData?.firstName} ${clientData?.lastName}.
Client data: ${JSON.stringify(clientData, null, 2)}

Include:
1. Quick summary (2 sentences max)
2. Key talking points (3-5 bullets)
3. Risks / opportunities to address
4. Suggested action items

Keep it concise — this is for the advisor's internal use before a meeting.`

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })
    res.json({ brief: response.content[0].text, clientName: `${clientData?.firstName} ${clientData?.lastName}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/priorities — generate today's AI-ranked priority list
router.post('/priorities', async (req, res) => {
  const clients = JSON.parse(readFileSync(join(__dirname, '../data/clients.json'), 'utf8'))
  const practice = JSON.parse(readFileSync(join(__dirname, '../data/practice.json'), 'utf8'))

  const alertClients = clients.filter(c => c.alertLevel !== 'none').map(c => ({
    name: `${c.firstName} ${c.lastName}`,
    aum: c.aum,
    alertLevel: c.alertLevel,
    alerts: c.alerts,
    daysSinceContact: c.daysSinceContact,
    meetings: c.meetings
  }))

  const prompt = `Based on the following client alerts and practice data, generate today's top 5 priorities for James in JSON format.

Clients with alerts: ${JSON.stringify(alertClients, null, 2)}
Practice hurdles: ${JSON.stringify(practice.hurdles, null, 2)}

Return a JSON array of 5 priority objects with this shape:
{
  "rank": 1,
  "title": "short action title",
  "description": "2-3 sentences with specific names and numbers",
  "urgency": "critical|high|medium",
  "category": "client|practice|meeting",
  "primaryAction": "action button label",
  "primaryPrompt": "the prompt to send to AI when button is clicked",
  "estimatedImpact": "dollar or % impact if applicable"
}

Return only valid JSON, no markdown.`

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].text.replace(/```json|```/g, '').trim()
    const priorities = JSON.parse(text)
    res.json({ priorities })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
