import type { ReactNode } from "react"
import { creditStatus, type Credit } from "../api"

/* Status pill — consistent across registry, cards and detail views. */
export function StatusPill({ credit }: { credit: Credit }) {
  const status = creditStatus(credit)
  const styles: Record<string, string> = {
    Verified: "border-emerald/30 bg-emerald/10 text-emerald-bright",
    Retired: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    Pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

/* Editorial section heading with eyebrow + balanced title. */
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
      {eyebrow && <p className="eyebrow text-emerald-bright">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">{title}</h2>
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-mute">{intro}</p>
      )}
    </div>
  )
}

/* Surface card with hairline border. */
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-ink-2 ${className}`}
    >
      {children}
    </div>
  )
}
