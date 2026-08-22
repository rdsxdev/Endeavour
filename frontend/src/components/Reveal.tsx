import type { CSSProperties, ReactNode } from "react"
import { useReveal } from "../hooks"

type RevealProps = {
  children: ReactNode
  className?: string
  /** Stagger delay in ms */
  delay?: number
  as?: "div" | "section" | "article" | "li"
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useReveal<HTMLElement>()
  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties

  return (
    <Tag ref={ref as never} className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  )
}
