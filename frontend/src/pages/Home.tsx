import { Link } from "react-router-dom"
import { ArrowRight, ShieldCheck, Repeat, Flame, FileSearch, Globe as Globe2, Layers, Lock } from "lucide-react"
import { useReveal, useCountUp, useCredits } from "../hooks"
import { formatCompact } from "../api"
import { computeStats } from "../stats"
import CreditCard from "../components/CreditCard"
import NetworkStatus from "../components/NetworkStatus"
import heroForest from "../assets/hero-forest.jpg"
import satellite from "../assets/satellite.jpg"
import heroRenewable from "../assets/hero-renewable.jpg"

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <img
        src={heroForest || "/placeholder.svg"}
        alt="Aerial view of rainforest canopy at sunrise"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="hero-veil absolute inset-0" />
      <div className="grid-bg absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-24 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald-bright">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-bright" />
            Blockchain Climate Infrastructure
          </span>

          <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.02] text-paper sm:text-6xl lg:text-7xl">
            Carbon credits,
            <br />
            <span className="text-emerald-bright">verifiable to the tonne.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-paper/80">
            Endeavour is the on-chain registry for issuing, verifying,
            transferring and retiring carbon credits — eliminating fraud, delay
            and double-counting with a single auditable source of truth.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/registry"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-emerald-bright"
            >
              Explore the Registry
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line-2 bg-ink/40 px-7 py-3.5 font-semibold text-paper backdrop-blur transition-colors hover:bg-ink/70"
            >
              How it works
            </Link>
          </div>

          <div className="mt-12">
            <NetworkStatus inline />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-mute lg:flex">
        <span className="text-[0.65rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-mute to-transparent" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Live metrics band                                                   */
/* ------------------------------------------------------------------ */

function Metric({
  value,
  suffix,
  label,
  decimals = 0,
}: {
  value: number
  suffix?: string
  label: string
  decimals?: number
}) {
  const { value: animated } = useCountUp(value)
  return (
    <div className="text-center">
      <p className="font-mono text-4xl font-bold text-paper sm:text-5xl">
        {decimals
          ? animated.toFixed(decimals)
          : formatCompact(Math.round(animated))}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-mute">{label}</p>
    </div>
  )
}

function MetricsBand() {
  const { credits } = useCredits()
  const stats = computeStats(credits)
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="border-y border-line bg-ink-2">
      <div
        ref={ref}
        className="reveal mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-5 py-16 lg:grid-cols-4 lg:px-8"
      >
        <Metric value={stats.tonnesOffset} suffix=" t" label="CO₂e Tokenized" />
        <Metric value={stats.tonnesRetired} suffix=" t" label="CO₂e Retired" />
        <Metric value={stats.activeProjects} label="Active Projects" />
        <Metric value={stats.countries} label="Countries" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Problem → Solution                                                  */
/* ------------------------------------------------------------------ */

function Problem() {
  const ref = useReveal<HTMLDivElement>()
  const points = [
    "Credits double-counted across disconnected registries",
    "Verification buried in PDFs no buyer can independently audit",
    "Settlement and retirement that takes weeks, not seconds",
  ]
  return (
    <section className="relative overflow-hidden py-24">
      <img
        src={satellite || "/placeholder.svg"}
        alt=""
        aria-hidden="true"
        className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 to-transparent" />
      <div ref={ref} className="reveal relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-emerald-bright">The Trust Gap</p>
          <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">
            The voluntary carbon market runs on faith, not proof.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-mute">
            Billions in climate finance flow through opaque ledgers where the
            same tonne can be sold twice and a credit&apos;s history disappears
            the moment it changes hands. Buyers deserve certainty.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-paper/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Lifecycle (Issue → Verify → Transfer → Retire)                      */
/* ------------------------------------------------------------------ */

function Lifecycle() {
  const ref = useReveal<HTMLDivElement>()
  const steps = [
    {
      icon: Layers,
      title: "Issue",
      body: "Project developers mint a credit on-chain with project, country and vintage permanently recorded.",
    },
    {
      icon: ShieldCheck,
      title: "Verify",
      body: "Each credit carries a verification flag backed by the immutable transaction that created it.",
    },
    {
      icon: Repeat,
      title: "Transfer",
      body: "Ownership moves peer-to-peer in seconds, with every hand-off written to the ledger.",
    },
    {
      icon: Flame,
      title: "Retire",
      body: "Retiring a credit permanently removes it from circulation — provable, final, fraud-proof.",
    },
  ]
  return (
    <section className="border-t border-line py-24">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-emerald-bright">The Credit Lifecycle</p>
          <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">
            One asset. Four states. Zero ambiguity.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="bg-ink-2 p-8">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/10 text-emerald-bright">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-sm text-mute">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-paper">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Capabilities                                                        */
/* ------------------------------------------------------------------ */

function Capabilities() {
  const ref = useReveal<HTMLDivElement>()
  const features = [
    {
      icon: Lock,
      title: "Immutable provenance",
      body: "Every credit is anchored to the block that created it. History cannot be rewritten or quietly edited.",
    },
    {
      icon: FileSearch,
      title: "Audit-grade transparency",
      body: "Anyone can inspect ownership, vintage and retirement status without trusting an intermediary.",
    },
    {
      icon: Globe2,
      title: "Global, borderless settlement",
      body: "Transfer credits across jurisdictions instantly — no clearing houses, no reconciliation lag.",
    },
  ]
  return (
    <section className="border-t border-line bg-ink-2 py-24">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <p className="eyebrow text-emerald-bright">Why Endeavour</p>
            <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">
              Infrastructure built for the institutions that hold the line on
              climate integrity.
            </h2>
            <p className="mt-4 leading-relaxed text-mute">
              From registry to retirement, every action is cryptographically
              recorded — giving funds, corporates and regulators a shared,
              tamper-evident source of truth.
            </p>
            <Link
              to="/analytics"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-emerald-bright hover:gap-3 transition-all"
            >
              View market analytics <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-5 rounded-2xl border border-line bg-ink p-6 transition-colors hover:border-line-2"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald-bright">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-paper">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Featured registry assets                                            */
/* ------------------------------------------------------------------ */

function Featured() {
  const { credits, loading } = useCredits()
  const ref = useReveal<HTMLDivElement>()
  const featured = (credits as any[]).filter((c) => c.verified && !c.retired).slice(0, 3)

  return (
    <section className="border-t border-line py-24">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow text-emerald-bright">Featured Assets</p>
            <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">
              Verified projects, live on the registry.
            </h2>
          </div>
          <Link
            to="/registry"
            className="inline-flex items-center gap-2 font-semibold text-emerald-bright hover:gap-3 transition-all"
          >
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-line bg-ink-2"
                />
              ))
            : featured.map((c) => <CreditCard key={c.id} credit={c} />)}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Closing CTA                                                         */
/* ------------------------------------------------------------------ */

function ClosingCTA() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section className="relative overflow-hidden border-t border-line">
      <img
        src={heroRenewable || "/placeholder.svg"}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/85" />
      <div
        ref={ref}
        className="reveal relative mx-auto max-w-3xl px-5 py-28 text-center lg:px-8"
      >
        <h2 className="text-balance text-4xl font-bold text-paper sm:text-5xl">
          Bring proof to your carbon strategy.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-paper/80">
          Issue your first credit, explore the live registry, or audit the
          market in real time. Everything is on-chain.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-emerald-bright"
          >
            Create a credit <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/registry"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-line-2 bg-ink/40 px-7 py-3.5 font-semibold text-paper backdrop-blur transition-colors hover:bg-ink/70"
          >
            Explore registry
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <MetricsBand />
      <Problem />
      <Lifecycle />
      <Capabilities />
      <Featured />
      <ClosingCTA />
    </>
  )
}
