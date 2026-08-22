import type { ReactNode } from "react"
import Reveal from "./Reveal"

export default function PageHeader({
  eyebrow,
  title,
  intro,
  children,
  image,
  imageAlt = "",
}: {
  eyebrow: string
  title: string
  intro?: string
  children?: ReactNode
  image?: string
  imageAlt?: string
}) {
  if (image) {
    return (
      <header className="relative min-h-[380px] overflow-hidden border-b border-line">
        <img
          src={image}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/90 via-paper/70 to-paper/30" />
        <div className="relative mx-auto flex min-h-[380px] max-w-7xl flex-col justify-end px-5 pb-12 pt-28 lg:px-8">
          <Reveal>
            <p className="eyebrow text-emerald-bright">{eyebrow}</p>
          </Reveal>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <Reveal delay={80} className="max-w-2xl">
              <h1 className="font-serif text-4xl text-ink sm:text-5xl">{title}</h1>
              {intro && (
                <p className="mt-4 text-lg leading-relaxed text-ink/70">{intro}</p>
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

  return (
    <header className="relative overflow-hidden border-b border-line bg-ink-2">
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-28 lg:px-8">
        <Reveal>
          <p className="eyebrow text-emerald-deep">{eyebrow}</p>
        </Reveal>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal delay={80} className="max-w-2xl">
            <h1 className="font-serif text-4xl text-paper sm:text-5xl">{title}</h1>
            {intro && (
              <p className="mt-4 text-lg leading-relaxed text-mute">{intro}</p>
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
