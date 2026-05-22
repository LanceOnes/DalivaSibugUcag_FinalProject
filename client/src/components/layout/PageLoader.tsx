import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PageSpinnerOverlay } from '@/components/ui/spinner'

export function PageLoader() {
  const { pathname } = useLocation()
  const [loading, setLoading] = useState(false)
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 400)
    return () => {
      clearTimeout(timer)
      setLoading(false)
    }
  }, [pathname])

  if (!loading) return null
  return <PageSpinnerOverlay />
}
