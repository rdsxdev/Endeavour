import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  History,
  Layers,
  MapPin,
  Satellite,
  ShieldCheck,
} from "lucide-react"
import {
  formatDate,
  formatNumber,
  getCredit,
  shortAddress,
  type Credit,
} from "../api"
import { categoryOf, volumeOf } from "../stats"
import { StatusPill } from "../components/ui"
import forest from "../assets/project-forest.jpg"
import mangrove from "../assets/project-mangrove.jpg"
import solar from "../assets/project-solar.jpg"
import satellite from "../assets/satellite.jpg"

export default function ProjectDetails() {
  const { id } = useParams()
  const [credit, setCredit] = useState<Credit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const parsed = Number(id)
    if (Number.isNaN(parsed)) {
      setLoading(false)
      return
    }
    getCredit(parsed)
      .then(setCredit)
      .finally(() => setLoading(false))
  }, [id])

  const image = useMemo(() => {
    if (!credit) return forest
    const category = categoryOf(credit.project)
    if (category === "Blue Carbon") return mangrove
    if (category === "Renewable Energy") return solar
    return forest
  }, [credit])

  if (loading) {
    return <div className="min-h-[70vh] bg-ink pt-28 text-center text-mute">Loading project record...</div>
  }

  if (!credit) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-5 text-center">
        <h1 className="text-3xl font-bold text-paper">Credit not found</h1>
        <Link to="/registry" className="mt-6 inline-flex items-center gap-2 text-emerald-deep">
          <ArrowLeft className="h-4 w-4" /> Back to registry
        </Link>
      </div>
    )
  }

  const category = categoryOf(credit.project)
  const volume = volumeOf(credit)
  const timeline = [
    ["Project registered", formatDate(credit.created_at), "Project metadata anchored to the registry."],
    ["Verification review", credit.verified ? "Complete" : "In progress", "Verifier status published for market inspection."],
    ["Blockchain issuance", `#${credit.id.toString().padStart(4, "0")}`, "Credit identity and ownership written to the ledger."],
    ["Retirement status", credit.retired ? "Retired" : "Available", "Final retirement is permanent and auditable."],
  ]

  return (
    <div className="bg-ink pb-24">
      <section className="relative min-h-[520px] overflow-hidden">
        <img src={image} alt={`${credit.project} project landscape`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/38 to-transparent" />
        <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col justify-end px-5 pb-14 pt-28 text-white lg:px-8">
          <Link to="/registry" className="mb-8 inline-flex w-fit items-center gap-2 text-sm text-white/75 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Registry
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill credit={credit} />
            <span className="rounded-full bg-white/14 px-3 py-1 font-mono text-xs backdrop-blur">
              #{credit.id.toString().padStart(4, "0")}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-tight sm:text-6xl">
            {credit.project}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/82">
            A registry-grade {category.toLowerCase()} asset from {credit.country},
            issued for the {credit.vintage_year} vintage and traceable through
            Endeavour ownership history.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-10 grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_380px] lg:px-8">
        <main className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={<MapPin />} label="Country" value={credit.country} />
            <Metric icon={<Layers />} label="Category" value={category} />
            <Metric icon={<History />} label="Vintage" value={String(credit.vintage_year)} mono />
            <Metric icon={<Activity />} label="Volume" value={`${formatNumber(volume)} tCO2e`} mono accent />
          </section>

          <section className="rounded-3xl border border-line bg-ink p-7 shadow-sm">
            <p className="eyebrow text-emerald-deep">Project Overview</p>
            <h2 className="mt-3 text-3xl font-bold text-paper">Impact record</h2>
            <p className="mt-4 text-lg leading-relaxed text-mute">
              Endeavour presents credit provenance, verification state,
              ownership and retirement status as one inspectable record. This
              page combines project metadata with blockchain verification so
              buyers can understand the asset before acting on it.
            </p>
          </section>

          <section className="rounded-3xl border border-line bg-ink p-7 shadow-sm">
            <p className="eyebrow text-emerald-deep">Verification Timeline</p>
            <div className="mt-8 grid gap-5">
              {timeline.map(([title, date, body], i) => (
                <div key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep">
                    {i === 0 ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                  </span>
                  <div className="border-b border-line pb-5 last:border-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="font-semibold text-paper">{title}</h3>
                      <span className="font-mono text-xs text-mute">{date}</span>
                    </div>
                    <p className="mt-1 text-sm text-mute">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-line bg-ink shadow-sm">
              <img src={satellite} alt="Satellite imagery visualization" className="h-64 w-full object-cover" />
              <div className="p-7">
                <p className="eyebrow text-emerald-deep">Satellite Imagery</p>
                <p className="mt-3 text-mute">
                  Remote-sensing context supports the measurement layer behind
                  project verification.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-ink p-7 shadow-sm">
              <p className="eyebrow text-emerald-deep">Climate Impact</p>
              <p className="mt-5 font-mono text-5xl font-semibold text-paper">
                {formatNumber(volume)}
              </p>
              <p className="mt-2 text-mute">tonnes CO2e represented by this credit record.</p>
              <div className="mt-8 h-3 overflow-hidden rounded-full bg-ink-3">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-deep to-emerald" />
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-line bg-ink p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-paper">Blockchain Verification</h3>
            <dl className="mt-5 space-y-4 text-sm">
              <Meta label="Current owner" value={shortAddress(credit.owner)} />
              <Meta label="Credit ID" value={`#${credit.id.toString().padStart(4, "0")}`} />
              <Meta label="Issued" value={formatDate(credit.created_at)} />
              <Meta label="State" value={credit.retired ? "Retired" : credit.verified ? "Verified" : "Pending"} />
            </dl>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald-deep">
              View on Block Explorer <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-3xl border border-line bg-ink-2 p-6">
            <h3 className="text-lg font-semibold text-paper">Map Section</h3>
            <div className="mt-4 flex h-56 items-center justify-center rounded-2xl border border-line bg-ink grid-bg">
              <div className="text-center">
                <Satellite className="mx-auto h-8 w-8 text-emerald-deep" />
                <p className="mt-3 font-semibold text-paper">{credit.country}</p>
                <p className="text-sm text-mute">Geospatial boundary preview</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
  mono = false,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
  accent?: boolean
}) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${accent ? "border-emerald/30 bg-emerald/10" : "border-line bg-ink"}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-emerald-deep [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-mute">{label}</p>
      <p className={`mt-1 font-semibold text-paper ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0">
      <dt className="text-mute">{label}</dt>
      <dd className="font-mono text-paper">{value}</dd>
    </div>
  )
}
