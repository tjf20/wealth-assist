import { useState, useCallback, useRef } from 'react'

const API = '/api/ai'

export function useAIChat() {
  const [messages, setMessages]   = useState([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError]         = useState(null)
  const abortRef                  = useRef(null)

  const sendMessage = useCallback(async (userText, clientContext = null) => {
    const userMsg = { role: 'user', content: userText }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setStreaming(true)
    setError(null)

    const assistantMsg = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, clientContext }),
        signal: controller.signal
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const payload = line.slice(6)
          if (payload === '[DONE]') continue
          try {
            const { text } = JSON.parse(payload)
            if (text) {
              setMessages(prev => {
                const copy = [...prev]
                copy[copy.length - 1] = { role: 'assistant', content: copy[copy.length - 1].content + text }
                return copy
              })
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      setStreaming(false)
    }
  }, [messages])

  const clearChat = () => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
  }

  return { messages, streaming, error, sendMessage, clearChat }
}

export async function generateBrief(clientId, briefType = 'meeting') {
  const res = await fetch(`${API}/brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, briefType })
  })
  if (!res.ok) throw new Error('Failed to generate brief')
  return res.json()
}

export async function fetchPriorities() {
  const res = await fetch(`${API}/priorities`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to fetch priorities')
  return res.json()
}
