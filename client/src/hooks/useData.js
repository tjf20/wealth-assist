import { useState, useEffect } from 'react'

function useFetch(url) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!url) return
    setLoading(true)
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [url])

  return { data, loading, error }
}

export function useClients(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return useFetch(`/api/clients${qs ? '?' + qs : ''}`)
}

export function useClient(id) {
  return useFetch(id ? `/api/clients/${id}` : null)
}

export function usePractice() {
  return useFetch('/api/practice')
}

export function useMarkets() {
  return useFetch('/api/markets')
}

export function useReports(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return useFetch(`/api/reports${qs ? '?' + qs : ''}`)
}
