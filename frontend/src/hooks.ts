import { useEffect, useRef, useState } from "react"
import { getCredits, getHealth, type Credit, type HealthStatus, USING_LIVE_BACKEND } from "./api"

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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const start = value
    const range = target - start
    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(Math.round(start + range * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return { value, ref }
}

export function useCredits() {
  const [credits, setCredits] = useState<Credit[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let mounted = true

    async function fetchCredits() {
      try {
        setLoading(true)
        const data = await getCredits()
        if (mounted) {
          setCredits(data)
          setLive(USING_LIVE_BACKEND)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCredits()
    return () => { mounted = false }
  }, [])

  return { credits, loading, live }
}

export function useHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let mounted = true

    async function fetchHealth() {
      try {
        setLoading(true)
        const data = await getHealth()
        if (mounted) {
          setHealth(data)
          setLive(USING_LIVE_BACKEND)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchHealth()
    return () => { mounted = false }
  }, [])

  return { health, loading, live }
}