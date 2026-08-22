import type { ReactNode } from "react"
import { creditStatus, type Credit } from "../api"

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  Verified: {
    dot: "bg-emerald",
    text: "text-emerald-deep",
    bg: "bg-emerald/8",
  },
  Retired: {
    dot: "bg-sky",
    text: "text-sky",
    bg: "bg-sky/8",
  },
  Pending: {
    dot: "bg-amber",
    text: "text-amber",
    bg: "bg-amber/8",
  },
}

export function StatusPill({ credit }: { credit: Credit }) {
  const status = creditStatus(credit)
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Pending!

  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-0.5 text-[0.68rem] font-medium uppercase tracking-wide ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className = "",
}: {
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  align?: "left" | "center"
  className?: string
}) {
  return (
    <div
      className={`${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow && <p className="eyebrow text-emerald-deep">{eyebrow}</p>}
      <h2 className="font-serif mt-3 text-3xl text-paper sm:text-4xl">{title}</h2>
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-mute">{intro}</p>
      )}
    </div>
  )
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`surface ${className}`}>
      {children}
    </div>
  )
}

export function Metric({
  label,
  value,
  unit,
  sub,
}: {
  label: string
  value: string
  unit?: string
  sub?: string
}) {
  return (
    <div className="surface p-5">
      <p className="label">{label}</p>
      <p className="mt-2 font-mono text-2xl font-medium text-paper sm:text-3xl">
        {value}
        {unit && <span className="ml-1 text-base text-mute">{unit}</span>}
      </p>
      {sub && <p className="mt-1 text-xs text-mute">{sub}</p>}
    </div>
  )
}
