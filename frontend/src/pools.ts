/** Token pool definitions for Endeavour's multi-asset climate registry. */

export type PoolKind = "carbon" | "bio" | "bond"

export interface TokenPool {
  id: string
  kind: PoolKind
  name: string
  symbol: string
  description: string
  totalSupply: number
  available: number
  unit: string
  apy?: number
  jurisdictions: string[]
  /** Monthly volume trend (last 6 months, arbitrary units) */
  trend: number[]
}

export const POOLS: TokenPool[] = [
  {
    id: "carbon-prime",
    kind: "carbon",
    name: "CarbonPool Prime",
    symbol: "eCO₂",
    description:
      "Verified removal and avoidance credits from Verra-aligned projects, pooled for institutional settlement.",
    totalSupply: 2_840_000,
    available: 412_000,
    unit: "tCO₂e",
    jurisdictions: ["Indonesia", "Brazil", "Kenya", "India"],
    trend: [68, 72, 81, 79, 88, 94],
  },
  {
    id: "bio-reserve",
    kind: "bio",
    name: "BioPool Reserve",
    symbol: "eBIO",
    description:
      "Biodiversity and habitat conservation tokens tied to REDD+ and wildlife corridor projects.",
    totalSupply: 890_000,
    available: 156_000,
    unit: "bio-units",
    apy: 4.2,
    jurisdictions: ["Cambodia", "Colombia", "Malaysia"],
    trend: [42, 48, 51, 55, 58, 62],
  },
  {
    id: "bond-sovereign",
    kind: "bond",
    name: "Green Bond Vault",
    symbol: "eGBND",
    description:
      "Tokenized sovereign green bonds — government-backed instruments funding national decarbonisation.",
    totalSupply: 120_000_000,
    available: 18_400_000,
    unit: "USD",
    apy: 3.8,
    jurisdictions: ["Germany", "France", "Singapore", "UK"],
    trend: [90, 92, 91, 95, 97, 98],
  },
]

export function poolByKind(kind: PoolKind): TokenPool | undefined {
  return POOLS.find((p) => p.kind === kind)
}

export function poolColor(kind: PoolKind): string {
  switch (kind) {
    case "carbon":
      return "var(--color-pool-carbon)"
    case "bio":
      return "var(--color-pool-bio)"
    case "bond":
      return "var(--color-pool-bond)"
  }
}

export function poolLabel(kind: PoolKind): string {
  switch (kind) {
    case "carbon":
      return "CarbonPool"
    case "bio":
      return "BioPool"
    case "bond":
      return "Green Bond"
  }
}
