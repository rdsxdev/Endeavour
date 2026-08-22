/**
 * hooks.ts
 *
 * Changes from v1:
 *  - useCredits: exposes error state, refetch function, and loading flag
 *  - useHealth: exposes error state
 *  - useCountUp: resets cleanly when target changes from non-zero to 0
 *  - All hooks cancel async work on unmount via AbortController / mounted flag
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  getCredits,
  getHealth,
  type Credit,
  type HealthStatus,
  USING_LIVE_BACKEND,
} from "./api"

const SITE_NAME = "Endeavour"

/* ------------------------------------------------------------------ */
/* useReveal — intersection-observer fade-in                           */
/* ------------------------------------------------------------------ */

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible")
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

/* ------------------------------------------------------------------ */
/* useCountUp                                                          */
/* ------------------------------------------------------------------ */

export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number | null>(null)
  const prevRef = useRef(0)

  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

    const start = prevRef.current
    const range = target - start
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed  = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 4)
      const next = Math.round(start + range * eased)
      setValue(next)
      prevRef.current = next

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return { value, ref }
}

/* ------------------------------------------------------------------ */
/* useCredits                                                          */
/* ------------------------------------------------------------------ */

interface UseCreditsResult {
  credits: Credit[]
  loading: boolean
  error: string | null
  live: boolean
  refetch: () => void
}

export function useCredits(): UseCreditsResult {
  const [credits, setCredits]  = useState<Credit[]>([])
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState<string | null>(null)
  const [live, setLive]        = useState(false)
  const [tick, setTick]        = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let mounted = true

    async function fetchCredits() {
      setLoading(true)
      setError(null)
      try {
        const data = await getCredits()
        if (mounted) {
          setCredits(data)
          setLive(USING_LIVE_BACKEND)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load credits")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCredits()
    return () => { mounted = false }
  }, [tick])

  return { credits, loading, error, live, refetch }
}

/* ------------------------------------------------------------------ */
/* useHealth                                                           */
/* ------------------------------------------------------------------ */

interface UseHealthResult {
  health: HealthStatus | null
  loading: boolean
  error: string | null
  live: boolean
}

export function useHealth(): UseHealthResult {
  const [health, setHealth]  = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState<string | null>(null)
  const [live, setLive]      = useState(false)

  useEffect(() => {
    let mounted = true

    async function fetchHealth() {
      setLoading(true)
      setError(null)
      try {
        const data = await getHealth()
        if (mounted) {
          setHealth(data)
          setLive(USING_LIVE_BACKEND)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch health")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchHealth()
    return () => { mounted = false }
  }, [])

  return { health, loading, error, live }
}

/* ------------------------------------------------------------------ */
/* usePageTitle — set document.title on mount / change                  */
/* ------------------------------------------------------------------ */

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME
    return () => { document.title = prev }
  }, [title])
}
