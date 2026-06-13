import { Credit, TONNES_PER_CREDIT } from "../api"

export interface RegistryStats {
  totalCredits: number
  verifiedCredits: number
  retiredCredits: number
  activeProjects: number
  countries: number
  tonnesOffset: number
  tonnesRetired: number
  verifiedPct: number
}

/** Derive headline metrics from the raw on-chain credit list. */
export function computeStats(credits: Credit[]): RegistryStats {
  const totalCredits = credits.length
  const verifiedCredits = credits.filter((c) => c.verified).length
  const retiredCredits = credits.filter((c) => c.retired).length
  const activeProjects = new Set(
    credits.filter((c) => !c.retired).map((c) => c.project),
  ).size
  const countries = new Set(credits.map((c) => c.country)).size

  return {
    totalCredits,
    verifiedCredits,
    retiredCredits,
    activeProjects,
    countries,
    tonnesOffset: totalCredits * TONNES_PER_CREDIT,
    tonnesRetired: retiredCredits * TONNES_PER_CREDIT,
    verifiedPct:
      totalCredits === 0
        ? 0
        : Math.round((verifiedCredits / totalCredits) * 100),
  }
}

/** Map a project to a representative category + imagery key. */
export type Category =
  | "Forest Conservation"
  | "Reforestation"
  | "Renewable Energy"
  | "Blue Carbon"
  | "Peatland"

const KEYWORDS: { match: RegExp; category: Category }[] = [
  { match: /wind|solar|power|energy/i, category: "Renewable Energy" },
  { match: /mangrove|blue carbon|coastal|delta/i, category: "Blue Carbon" },
  { match: /peat/i, category: "Peatland" },
  { match: /reforest|afforest|restoration|plantation/i, category: "Reforestation" },
  { match: /redd|forest|conservation|reserve|park|habitat/i, category: "Forest Conservation" },
]

export function categoryOf(project: string): Category {
  for (const k of KEYWORDS) if (k.match.test(project)) return k.category
  return "Forest Conservation"
}

/** Deterministic pseudo-volume so cards show realistic credit amounts. */
export function volumeOf(c: Credit): number {
  const base = (c.id * 7919 + c.vintage_year * 131) % 880
  return (base + 120) * 1000
}
