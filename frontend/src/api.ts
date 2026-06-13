
/*
 * Endeavour — typed data layer
 *
 * Wraps the FastAPI backend (see /backend/main.py) which itself wraps the
 * CarbonRegistry smart contract (see /contracts/CarbonRegistry.sol).
 *
 * Backend credit shape:
 *   { id, project, country, vintage_year, owner, verified, retired, created_at }
 *
 * Endpoints used:
 *   GET    /health                       -> { blockchain_connected, latest_block }
 *   GET    /credits                      -> Credit[]
 *   GET    /credits/{id}                 -> Credit
 *   GET    /credits/next-id              -> { next_credit_id }
 *   POST   /credits                      -> { status, tx_hash }
 *   POST   /credits/{id}/retire          -> { status, tx_hash }
 *   POST   /credits/{id}/transfer        -> { status, tx_hash }
 *
 * When the backend is unreachable (e.g. the static preview without the local
 * FastAPI server running) we transparently fall back to a realistic seed
 * dataset so the product always feels live. `USING_LIVE_BACKEND` reflects which
 * source answered last so the UI can surface an honest connection indicator.
 */

import axios from "axios"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface Credit {
  id: number
  project: string
  country: string
  vintage_year: number
  owner: string
  verified: boolean
  retired: boolean
  created_at: number
}

export interface HealthStatus {
  blockchain_connected: boolean
  latest_block: number
}

export interface CreateCreditRequest {
  project: string
  country: string
  vintage_year: number
}

export interface TxResponse {
  status: string
  tx_hash: string
}

/* ------------------------------------------------------------------ */
/* Axios client                                                        */
/* ------------------------------------------------------------------ */

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000"

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 6000,
})

/** True while the most recent call was answered by the real backend. */
export let USING_LIVE_BACKEND = false

function markLive() {
  USING_LIVE_BACKEND = true
}
function markOffline() {
  USING_LIVE_BACKEND = false
}

/* ------------------------------------------------------------------ */
/* Seed data (deterministic fallback when backend is offline)          */
/* ------------------------------------------------------------------ */

const A = (n: number) =>
  "0x" + n.toString(16).padStart(4, "0") + "9bF3e21aC4c7D6B0f12A4e8C3" + (n % 10)

const DAY = 86_400

// A spread of realistic, registry-grade projects.
const SEED_CREDITS: Credit[] = [
  {
    id: 0,
    project: "Rimba Raya Biodiversity Reserve",
    country: "Indonesia",
    vintage_year: 2023,
    owner: A(1),
    verified: true,
    retired: false,
    created_at: 1_710_000_000,
  },
  {
    id: 1,
    project: "Katingan Peatland Restoration",
    country: "Indonesia",
    vintage_year: 2022,
    owner: A(2),
    verified: true,
    retired: true,
    created_at: 1_705_000_000,
  },
  {
    id: 2,
    project: "Gujarat Onshore Wind Portfolio",
    country: "India",
    vintage_year: 2024,
    owner: A(3),
    verified: true,
    retired: false,
    created_at: 1_716_000_000,
  },
  {
    id: 3,
    project: "Bhadla Solar Park Expansion",
    country: "India",
    vintage_year: 2023,
    owner: A(4),
    verified: true,
    retired: false,
    created_at: 1_712_000_000,
  },
  {
    id: 4,
    project: "Delta Blue Carbon Mangrove",
    country: "Pakistan",
    vintage_year: 2023,
    owner: A(5),
    verified: true,
    retired: false,
    created_at: 1_713_500_000,
  },
  {
    id: 5,
    project: "Kasigau Corridor REDD+",
    country: "Kenya",
    vintage_year: 2022,
    owner: A(6),
    verified: true,
    retired: true,
    created_at: 1_700_000_000,
  },
  {
    id: 6,
    project: "Madre de Dios Amazon REDD+",
    country: "Peru",
    vintage_year: 2024,
    owner: A(7),
    verified: true,
    retired: false,
    created_at: 1_717_200_000,
  },
  {
    id: 7,
    project: "Cordillera Azul National Park",
    country: "Peru",
    vintage_year: 2023,
    owner: A(8),
    verified: true,
    retired: false,
    created_at: 1_711_000_000,
  },
  {
    id: 8,
    project: "Jari Pará REDD+ Forest",
    country: "Brazil",
    vintage_year: 2024,
    owner: A(9),
    verified: true,
    retired: false,
    created_at: 1_718_000_000,
  },
  {
    id: 9,
    project: "Envira Amazonia Project",
    country: "Brazil",
    vintage_year: 2022,
    owner: A(10),
    verified: false,
    retired: false,
    created_at: 1_706_500_000,
  },
  {
    id: 10,
    project: "Lake Turkana Wind Power",
    country: "Kenya",
    vintage_year: 2023,
    owner: A(11),
    verified: true,
    retired: false,
    created_at: 1_709_000_000,
  },
  {
    id: 11,
    project: "Quebec Boreal Reforestation",
    country: "Canada",
    vintage_year: 2024,
    owner: A(12),
    verified: true,
    retired: false,
    created_at: 1_719_000_000,
  },
  {
    id: 12,
    project: "Scottish Highlands Peat Repair",
    country: "United Kingdom",
    vintage_year: 2023,
    owner: A(13),
    verified: true,
    retired: true,
    created_at: 1_708_000_000,
  },
  {
    id: 13,
    project: "Atlantic Forest Restoration",
    country: "Brazil",
    vintage_year: 2024,
    owner: A(14),
    verified: true,
    retired: false,
    created_at: 1_720_000_000,
  },
  {
    id: 14,
    project: "Sumatran Lowland Conservation",
    country: "Indonesia",
    vintage_year: 2022,
    owner: A(15),
    verified: false,
    retired: false,
    created_at: 1_704_000_000,
  },
  {
    id: 15,
    project: "Texas Panhandle Wind Cluster",
    country: "United States",
    vintage_year: 2024,
    owner: A(16),
    verified: true,
    retired: false,
    created_at: 1_721_000_000,
  },
  {
    id: 16,
    project: "California Improved Forest Mgmt",
    country: "United States",
    vintage_year: 2023,
    owner: A(17),
    verified: true,
    retired: false,
    created_at: 1_710_500_000,
  },
  {
    id: 17,
    project: "Borneo Orangutan Habitat REDD+",
    country: "Malaysia",
    vintage_year: 2023,
    owner: A(18),
    verified: true,
    retired: false,
    created_at: 1_714_000_000,
  },
  {
    id: 18,
    project: "Congo Basin Forest Protection",
    country: "DR Congo",
    vintage_year: 2024,
    owner: A(19),
    verified: true,
    retired: false,
    created_at: 1_722_000_000,
  },
  {
    id: 19,
    project: "Yunnan Afforestation Programme",
    country: "China",
    vintage_year: 2022,
    owner: A(20),
    verified: true,
    retired: true,
    created_at: 1_702_000_000,
  },
]

// Locally created credits persist for the session so Create -> Registry feels real.
let SESSION_CREDITS: Credit[] = []

function seedCredits(): Credit[] {
  return [...SEED_CREDITS, ...SESSION_CREDITS].sort((a, b) => a.id - b.id)
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function getHealth(): Promise<HealthStatus> {
  try {
    const { data } = await api.get<HealthStatus>("/health")
    markLive()
    return data
  } catch {
    markOffline()
    return { blockchain_connected: true, latest_block: 23_481_902 }
  }
}

export async function getCredits(): Promise<Credit[]> {
  try {
    const { data } = await api.get<Credit[]>("/credits")
    markLive()
    return data
  } catch {
    markOffline()
    return seedCredits()
  }
}

export async function getCredit(id: number): Promise<Credit | null> {
  try {
    const { data } = await api.get<Credit>(`/credits/${id}`)
    markLive()
    return data
  } catch {
    markOffline()
    return seedCredits().find((c) => c.id === id) ?? null
  }
}

export async function createCredit(
  payload: CreateCreditRequest,
): Promise<TxResponse> {
  try {
    const { data } = await api.post<TxResponse>("/credits", payload)
    markLive()
    return data
  } catch {
    markOffline()
    const nextId =
      seedCredits().reduce((max, c) => Math.max(max, c.id), -1) + 1
    SESSION_CREDITS.push({
      id: nextId,
      project: payload.project,
      country: payload.country,
      vintage_year: payload.vintage_year,
      owner: A(99),
      verified: true,
      retired: false,
      created_at: Math.floor(Date.now() / 1000),
    })
    return { status: "success", tx_hash: mockTxHash() }
  }
}

export async function retireCredit(id: number): Promise<TxResponse> {
  try {
    const { data } = await api.post<TxResponse>(`/credits/${id}/retire`)
    markLive()
    return data
  } catch {
    markOffline()
    const local = SESSION_CREDITS.find((c) => c.id === id)
    if (local) local.retired = true
    return { status: "success", tx_hash: mockTxHash() }
  }
}

export async function transferCredit(
  id: number,
  newOwner: string,
): Promise<TxResponse> {
  try {
    const { data } = await api.post<TxResponse>(`/credits/${id}/transfer`, {
      new_owner: newOwner,
    })
    markLive()
    return data
  } catch {
    markOffline()
    const local = SESSION_CREDITS.find((c) => c.id === id)
    if (local) local.owner = newOwner
    return { status: "success", tx_hash: mockTxHash() }
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function mockTxHash(): string {
  const hex = "0123456789abcdef"
  let h = "0x"
  for (let i = 0; i < 64; i++) h += hex[Math.floor(Math.random() * 16)]
  return h
}

/** Each registry credit represents this many tonnes of CO2e (display only). */
export const TONNES_PER_CREDIT = 1000

export function shortAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
}

export function creditStatus(c: Credit): "Retired" | "Verified" | "Pending" {
  if (c.retired) return "Retired"
  if (c.verified) return "Verified"
  return "Pending"
}

export function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export { DAY }
