import { useEffect, useRef, useState } from "react"

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.classList.add("revealed")
    }
  }, [])

  return ref
}

export function useCountUpRef(target: number) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    setValue(target)
  }, [target])

  return { ref, value }
}

export function useCredits() {
  return {
    credits: [],
    loading: false,
  }
}

export function useHealth() {
  return {
    health: {
      blockchain_connected: true,
    },
    live: true,
  }
}