import { useState, useEffect } from 'react'
import { requestService } from '@/lib/services'
import type { FunnelReport } from '@/types/api'

export function useFunnelReport(requestId: string) {
  const [data, setData] = useState<FunnelReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    requestService
      .getFunnelReport(requestId)
      .then(setData)
      .catch((e: unknown) => {
        const msg = (e as any)?.response?.data?.message
        setError(typeof msg === 'string' ? msg : 'Unable to load funnel report')
      })
      .finally(() => setIsLoading(false))
  }, [requestId])

  return { data, isLoading, error }
}
