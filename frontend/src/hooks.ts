import { useEffect, useRef, useState, useCallback } from "react"
import {
  getCredits,
  getHealth,
  type Credit,
  type HealthStatus,
  USING_LIVE_BACKEND,
} from "../api"

/* ------------------------------------------------------------------ */
/* useCredits — load + cache the full registry                         */
/* ------------------------------------------------------------------ */

interface CreditsState {
  credits: Credit[]
  loading: boolean
  live: boolean
  refresh: () => void
}

// Simple module-level cache so navigating between pages is instant.
let CACHE: Credit[] | null = null

export function useCredits(): CreditsState {
  const [credits, setCredits] = useState<Credit[]>(CACHE ?? [])
  const [loading, setLoading] = useState<boolean>(CACHE === null)
  const [live, setLive] = useState<boolean>(USING_LIVE_BACKEND)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getCredits()
    CACHE = data
    setCredits(data)
    setLive(USING_LIVE_BACKEND)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { credits, loading, live, refresh: load }
}

/* ------------------------------------------------------------------ */
/* useHealth — blockchain connection status                            */
/* ------------------------------------------------------------------ */

export function useHealth(): { health: HealthStatus | null; live: boolean } {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [live, setLive] = useState<boolean>(false)

  useEffect(() => {
    let active = true
    void getHealth().then((h) => {
      if (!active) return
      setHealth(h)
      setLive(USING_LIVE_BACKEND)
    })
    return () => {
      active = false
    }
  }, [])

  return { health, live }
}

/* ------------------------------------------------------------------ */
/* useReveal — IntersectionObserver scroll reveal                      */
/* ------------------------------------------------------------------ */

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return ref
}

/* ------------------------------------------------------------------ */
/* useCountUp — animated metric counter                                */
/* ------------------------------------------------------------------ */

export function useCountUp(target: number, durationMs = 1600): number {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  const started = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      // No anchor — animate immediately.
      run()
      return
    }
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true
        run()
        obs.disconnect()
      }
    })
    obs.observe(node)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  function run() {
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  return value
}

/* Hook variant that also returns an anchor ref to trigger on view. */
export function useCountUpRef(target: number, durationMs = 1600) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  const started = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / durationMs, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setValue(target * eased)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    })
    obs.observe(node)
    return () => obs.disconnect()
  }, [target, durationMs])

  return { value, ref }
}
