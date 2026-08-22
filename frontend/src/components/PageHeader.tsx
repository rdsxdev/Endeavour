import type { ReactNode } from "react"
import Reveal from "./Reveal"

export default function PageHeader({
  eyebrow,
  title,
  intro,
  children,
  dark = false,
}: {
  eyebrow: string
  title: string
  intro?: string
  children?: ReactNode
  dark?: boolean
}) {
  return (
    <header
      className={`relative overflow-hidden border-b border-line ${
        dark ? "bg-paper text-ink" : "bg-ink-2"
      }`}
    >
      {!dark && <div className="grid-bg absolute inset-0 opacity-50" />}
      <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 lg:px-8">
        <Reveal>
          <p className={`eyebrow ${dark ? "text-emerald-bright" : "text-emerald-deep"}`}>
            {eyebrow}
          </p>
        </Reveal>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal delay={80} className="max-w-2xl">
            <h1
              className={`font-serif text-4xl sm:text-5xl ${
                dark ? "text-ink" : "text-paper"
              }`}
            >
              {title}
            </h1>
            {intro && (
              <p className={`mt-4 text-lg leading-relaxed ${dark ? "text-mute" : "text-mute"}`}>
                {intro}
              </p>
            )}
          </Reveal>
          {children && (
            <Reveal delay={160} className="shrink-0">
              {children}
            </Reveal>
          )}
        </div>
      </div>
    </header>
  )
}
