import { Link } from "react-router-dom"
import { MapPin, ArrowUpRight } from "lucide-react"
import { type Credit, formatNumber } from "../api"
import { StatusPill } from "./ui.tsx"
import { categoryOf, volumeOf } from "../stats"

import forest from "../assets/project-forest.jpg"
import solar from "../assets/project-solar.jpg"
import mangrove from "../assets/project-mangrove.jpg"
import renewable from "../assets/hero-renewable.jpg"
import canopy from "../assets/hero-forest.jpg"

const IMAGERY: Record<string, string> = {
  "Forest Conservation": canopy,
  Reforestation: forest,
  "Renewable Energy": solar,
  "Blue Carbon": mangrove,
  Peatland: renewable,
}

export default function CreditCard({ credit }: { credit: Credit }) {
  const category = categoryOf(credit.project)
  const image = IMAGERY[category] ?? forest
  const volume = volumeOf(credit)

  return (
    <Link
      to={`/credit/${credit.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-line-2 hover:shadow-2xl hover:shadow-black/40"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={`${credit.project} — ${category}`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/20 to-transparent" />
        <div className="absolute left-3 top-3">
          <StatusPill credit={credit} />
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[0.7rem] text-paper backdrop-blur">
          #{credit.id.toString().padStart(4, "0")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-emerald-bright">{category}</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-paper">
          {credit.project}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-mute">
          <MapPin className="h-3.5 w-3.5" />
          {credit.country}
        </p>

        <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-wider text-mute">
              Volume
            </p>
            <p className="font-mono text-sm text-paper">
              {formatNumber(volume)} <span className="text-mute">tCO₂e</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.7rem] uppercase tracking-wider text-mute">
              Vintage
            </p>
            <p className="font-mono text-sm text-paper">{credit.vintage_year}</p>
          </div>
        </div>

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-bright opacity-0 transition-opacity group-hover:opacity-100">
          View asset <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
