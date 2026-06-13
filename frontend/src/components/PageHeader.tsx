import type { ReactNode } from "react"

/** Compact page header used on inner (non-home) pages. */
export default function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  intro?: string
  children?: ReactNode
}) {
  return (
    <header className="border-b border-line bg-ink-2">
      <div className="grid-bg absolute" />
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-28 lg:px-8">
        <p className="eyebrow text-emerald-bright">{eyebrow}</p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-paper sm:text-5xl">
              {title}
            </h1>
            {intro && (
              <p className="mt-4 text-lg leading-relaxed text-mute">{intro}</p>
            )}
          </div>
          {children && <div className="shrink-0">{children}</div>}
        </div>
      </div>
    </header>
  )
}
