import { Link } from "react-router-dom"
import { type Credit, formatNumber } from "../api"
import { StatusPill } from "./ui"
import { categoryOf, volumeOf } from "../stats"
import { poolForCredit } from "../lib/poolForCredit"

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

const POOL_SYMBOL: Record<string, string> = {
  carbon: "eCO₂",
  bio: "eBIO",
  bond: "eGBND",
}

export default function CreditCard({ credit }: { credit: Credit }) {
  const category = categoryOf(credit.project)
  const image = IMAGERY[category] ?? forest
  const volume = volumeOf(credit)
  const pool = poolForCredit(credit)

  return (
    <Link
      to={`/credit/${credit.id}`}
      className="group surface flex flex-col overflow-hidden transition hover:border-emerald/40"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper/60 to-transparent" />
        <div className="absolute left-3 top-3">
          <StatusPill credit={credit} />
        </div>
        <span className="absolute right-3 top-3 bg-ink/90 px-2 py-0.5 font-mono text-[0.65rem] text-paper">
          {POOL_SYMBOL[pool]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="label">{category}</p>
        <h3 className="mt-1.5 font-serif text-lg leading-snug text-paper">{credit.project}</h3>
        <p className="mt-1 text-sm text-mute">{credit.country}</p>

        <div className="mt-auto flex items-end justify-between border-t border-line pt-4">
          <div>
            <p className="label">Volume</p>
            <p className="font-mono text-sm text-paper">
              {formatNumber(volume)} <span className="text-mute">tCO₂e</span>
            </p>
          </div>
          <div className="text-right">
            <p className="label">Vintage</p>
            <p className="font-mono text-sm text-paper">{credit.vintage_year}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
