import { useParams, Link } from "react-router-dom"
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Flame,
  ArrowLeft,
  Copy,
  ExternalLink,
  Clock,
} from "lucide-react"
import { useCredits } from "../hooks"
import {
  creditStatus,
  formatNumber,
  formatDate,
  shortAddress,
  type Credit,
} from "../api"
import { categoryOf, volumeOf } from "../stats"
import { StatusPill } from "../components/ui"
import forestImg from "../assets/project-forest.jpg"
import solarImg from "../assets/project-solar.jpg"
import mangroveImg from "../assets/project-mangrove.jpg"
import renewableImg from "../assets/hero-renewable.jpg"
import canopyImg from "../assets/hero-forest.jpg"

const IMAGERY: Record<string, string> = {
  "Forest Conservation": canopyImg,
  Reforestation: forestImg,
  "Renewable Energy": solarImg,
  "Blue Carbon": mangroveImg,
  Peatland: renewableImg,
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string | React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-line py-4">
      <span className="text-sm text-mute">{label}</span>
      <span
        className={`text-right text-sm ${mono ? "font-mono" : ""} text-paper`}
      >
        {value}
      </span>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="rounded p-1 text-mute hover:text-emerald-bright"
      aria-label="Copy to clipboard"
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  )
}

export default function ProjectDetails() {
  const { id } = useParams()
  const { credits, loading } = useCredits()
  const creditId = parseInt(id || "", 10)
  const credit = (credits as Credit[]).find((c) => c.id === creditId)

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-20 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-80 rounded-2xl bg-ink-2" />
          <div className="h-48 rounded-2xl bg-ink-2" />
        </div>
      </div>
    )
  }

  if (!credit) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8">
        <h1 className="text-2xl font-bold text-paper">Credit not found</h1>
        <p className="mt-3 text-mute">
          Credit #{creditId} does not exist or has been removed.
        </p>
        <Link
          to="/registry"
          className="mt-6 inline-flex items-center gap-2 font-medium text-emerald-bright"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Registry
        </Link>
      </div>
    )
  }

  const category = categoryOf(credit.project)
  const volume = volumeOf(credit)
  const status = creditStatus(credit)
  const image = IMAGERY[category] ?? forestImg

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
      {/* Back link */}
      <Link
        to="/registry"
        className="inline-flex items-center gap-2 text-sm text-mute hover:text-paper"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Registry
      </Link>

      {/* Hero card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-ink-2">
        <div className="relative h-64 overflow-hidden md:h-80">
          <img
            src={image}
            alt={credit.project}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <StatusPill credit={credit} />
              <p className="eyebrow mt-3 text-emerald-bright">{category}</p>
              <h1 className="mt-2 text-2xl font-bold text-paper md:text-3xl">
                {credit.project}
              </h1>
            </div>
            <span className="rounded-lg bg-ink/70 px-3 py-1.5 font-mono text-sm text-paper backdrop-blur">
              #{credit.id.toString().padStart(4, "0")}
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid border-t border-line md:grid-cols-3">
          <div className="flex items-center justify-center gap-3 border-b border-line py-6 md:border-b-0 md:border-r">
            <ShieldCheck className="h-5 w-5 text-emerald-bright" />
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-mute">
                Status
              </p>
              <p className="font-mono text-paper">{status}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 border-b border-line py-6 md:border-b-0 md:border-r">
            <MapPin className="h-5 w-5 text-emerald-bright" />
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-mute">
                Country
              </p>
              <p className="font-mono text-paper">{credit.country}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 py-6">
            <Calendar className="h-5 w-5 text-emerald-bright" />
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-mute">
                Vintage
              </p>
              <p className="font-mono text-paper">{credit.vintage_year}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Credit Details */}
        <div className="rounded-2xl border border-line bg-ink-2 p-6">
          <h2 className="text-lg font-semibold text-paper">Credit Details</h2>
          <div className="mt-4">
            <DetailRow label="Credit ID" value={`#${credit.id.toString().padStart(4, "0")}`} mono />
            <DetailRow label="Project Name" value={credit.project} />
            <DetailRow label="Category" value={category} />
            <DetailRow label="Country" value={credit.country} />
            <DetailRow label="Vintage Year" value={credit.vintage_year.toString()} mono />
            <DetailRow
              label="Carbon Volume"
              value={
                <>
                  {formatNumber(volume)} <span className="text-mute">tCO₂e</span>
                </>
              }
              mono
            />
          </div>
        </div>

        {/* Ownership & Provenance */}
        <div className="rounded-2xl border border-line bg-ink-2 p-6">
          <h2 className="text-lg font-semibold text-paper">
            Ownership & Provenance
          </h2>
          <div className="mt-4">
            <DetailRow
              label="Owner"
              value={
                <span className="flex items-center gap-2">
                  <span className="font-mono">{shortAddress(credit.owner)}</span>
                  <CopyButton text={credit.owner} />
                </span>
              }
            />
            <DetailRow
              label="Created"
              value={
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-mute" />
                  {formatDate(credit.created_at)}
                </span>
              }
            />
            <DetailRow
              label="Verified"
              value={
                <span className="flex items-center gap-2">
                  {credit.verified ? (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald-bright" /> Yes
                    </>
                  ) : (
                    "Pending"
                  )}
                </span>
              }
            />
            <DetailRow
              label="Retired"
              value={
                <span className="flex items-center gap-2">
                  {credit.retired ? (
                    <>
                      <Flame className="h-4 w-4 text-sky-300" /> Yes
                    </>
                  ) : (
                    "Active"
                  )}
                </span>
              }
            />
            <DetailRow
              label="Block"
              value={
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs">#{Math.floor(credit.created_at / 12).toLocaleString()}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-mute" />
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* Impact section */}
      <div className="mt-6 rounded-2xl border border-emerald/30 bg-emerald/10 p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-paper">
          <Flame className="h-5 w-5 text-emerald-bright" />
          Climate Impact
        </h2>
        <p className="mt-3 text-mute">
          This credit represents{" "}
          <span className="text-paper font-mono">{formatNumber(volume)} tCO₂e</span>{" "}
          of avoided or removed greenhouse gas emissions.
        </p>
        {credit.retired ? (
          <p className="mt-4 text-emerald-bright">
            This credit has been permanently retired. The represented carbon
            offset has been claimed and cannot be transferred or reused.
          </p>
        ) : (
          <p className="mt-4 text-mute">
            This credit is active and can be transferred or retired by its
            current owner.
          </p>
        )}
      </div>
    </div>
  )
}
