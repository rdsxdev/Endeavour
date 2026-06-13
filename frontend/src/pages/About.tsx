import { Link } from "react-router-dom"
import { ShieldCheck, Globe as Globe2, Lock, FileSearch, Leaf, ArrowRight, Building2, Landmark, Scale } from "lucide-react"
import { useReveal } from "../hooks"
import PageHeader from "../components/PageHeader"
import heroForest from "../assets/hero-forest.jpg"
import satellite from "../assets/satellite.jpg"

/* ------------------------------------------------------------------ */
/* The Problem                                                         */
/* ------------------------------------------------------------------ */

function TheProblem() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section ref={ref} className="reveal mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="max-w-xl">
          <p className="eyebrow text-emerald-bright">The Trust Gap</p>
          <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">
            Carbon markets run on promises, not proof.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-mute">
            The voluntary carbon market has grown to over $2 billion, yet
            fundamental infrastructure gaps undermine its credibility:
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-paper/90">
            {[
              "Credits can be double-counted across registries that don't communicate",
              "Verification records are buried in PDFs that buyers cannot independently audit",
              "Ownership transfers take weeks and require intermediaries",
              "Retirement claims cannot be verified after the fact",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={satellite}
            alt="Satellite view of Earth"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
          <div className="absolute bottom-6 left-6 max-w-xs">
            <p className="text-sm text-paper/80">
              Remote sensing data could validate every credit — if the
              infrastructure existed.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Our Approach                                                        */
/* ------------------------------------------------------------------ */

function OurApproach() {
  const ref = useReveal<HTMLDivElement>()
  const points = [
    {
      icon: Lock,
      title: "Immutable provenance",
      body: "Every credit is anchored to the block that created it. The transaction hash is a permanent, auditable record that cannot be rewritten or deleted.",
    },
    {
      icon: FileSearch,
      title: "Public verification",
      body: "Anyone can verify a credit's issuance, ownership history, and retirement status without relying on a gatekeeper or intermediary.",
    },
    {
      icon: Globe2,
      title: "Instant settlement",
      body: "Transfer credits between parties in seconds, not weeks. No clearing houses, no reconciliation, no counterparty risk.",
    },
    {
      icon: ShieldCheck,
      title: "Preventing double-counting",
      body: "A credit can only exist in one place at a time. Once retired, it cannot be revived, transferred, or counted again.",
    },
  ]

  return (
    <section className="border-t border-line bg-ink-2">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-emerald-bright">How Endeavour Works</p>
          <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">
            A single source of truth for every credit.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-mute">
            Endeavour replaces fragmented trust with cryptographic proof. When a
            credit is issued, its metadata is written to the blockchain — project
            name, country, vintage year, and the address that created it.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {points.map((p) => (
            <div
              key={p.title}
              className="flex gap-5 rounded-2xl border border-line bg-ink p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald-bright">
                <p.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-paper">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* For Whom                                                            */
/* ------------------------------------------------------------------ */

function ForWhom() {
  const ref = useReveal<HTMLDivElement>()
  const audiences = [
    {
      icon: Building2,
      title: "Project Developers",
      body: "Issue credits directly to the registry with full provenance. No intermediaries, no paperwork, no waiting weeks for your listing to appear.",
    },
    {
      icon: Landmark,
      title: "Corporate Buyers",
      body: "Acquire credits with full visibility into their origin. Audit ownership history before you buy, and prove retirement to your stakeholders after.",
    },
    {
      icon: Scale,
      title: "Regulators & Auditors",
      body: "Query the full history of any credit programmatically. No black-box databases, no trust required — just raw, verifiable ledger data.",
    },
  ]

  return (
    <section ref={ref} className="reveal mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="max-w-2xl">
        <p className="eyebrow text-emerald-bright">Built For</p>
        <h2 className="mt-3 text-3xl font-bold text-paper sm:text-4xl">
          The institutions that hold the line on climate integrity.
        </h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {audiences.map((a) => (
          <div key={a.title} className="rounded-2xl border border-line p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald-bright">
              <a.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-paper">
              {a.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">{a.body}</p>
          </div>
        ))}
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
        src={heroForest}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/90" />
      <div
        ref={ref}
        className="reveal relative mx-auto max-w-3xl px-5 py-24 text-center lg:px-8"
      >
        <Leaf className="mx-auto h-10 w-10 text-emerald-bright" />
        <h2 className="mt-6 text-balance text-4xl font-bold text-paper sm:text-5xl">
          Bring proof to your carbon strategy.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-paper/80">
          Explore the live registry, issue your first credit, or audit the
          market in real time. Everything is on-chain and independently
          verifiable.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/registry"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-emerald-bright"
          >
            Explore Registry <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-line-2 bg-ink/40 px-7 py-3.5 font-semibold text-paper backdrop-blur transition-colors hover:bg-ink/70"
          >
            Issue a Credit
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About Endeavour"
        title="On-Chain Infrastructure for Carbon Markets"
        intro="Endeavour is a blockchain-backed registry that replaces fragmented trust with cryptographic proof — enabling project developers, corporate buyers, and regulators to verify every credit from issuance to retirement."
      />
      <TheProblem />
      <OurApproach />
      <ForWhom />
      <ClosingCTA />
    </>
  )
}
