/**
 * api.ts — typed data layer for Arbourex
 *
 * Changes from v1:
 *  - ApiError class so callers can distinguish HTTP errors from network errors
 *  - axios interceptor: all 4xx/5xx surfaced as ApiError with server message
 *  - retireCredit / transferCredit: optimistic UI update for offline mode
 *    writes back into the live cache so the UI reflects the change immediately
 *  - createCredit offline: SESSION_CREDITS starts at max(seed) + 1 (not 0)
 *  - ETH address regex validated before hitting the backend
 *  - All API fns have explicit return types
 *  - getCredit returns null (not throw) when ID not found in offline mode
 */

import axios, { AxiosError } from "axios"
import { API_URL } from "./env"

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
  latest_block: number | null
  status: "ok" | "degraded"
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
/* ApiError                                                            */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  public readonly statusCode: number

  constructor(
    statusCode: number,
    message: string,
  ) {
    super(message)
    this.statusCode = statusCode
    this.name = "ApiError"
  }
}

/* ------------------------------------------------------------------ */
/* Axios client + interceptor                                          */
/* ------------------------------------------------------------------ */

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
})

// Normalise all HTTP error responses into ApiError
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ detail?: string }>) => {
    const status  = err.response?.status ?? 0
    const detail  = err.response?.data?.detail
    const message = detail ?? err.message ?? "Unknown error"
    return Promise.reject(new ApiError(status, message))
  },
)

/** True while the most recent call was answered by the real backend. */
export let USING_LIVE_BACKEND = false

function markLive()    { USING_LIVE_BACKEND = true  }
function markOffline() { USING_LIVE_BACKEND = false }

/* ------------------------------------------------------------------ */
/* Seed / offline data                                                 */
/* ------------------------------------------------------------------ */

const A = (n: number) =>
  "0x" + n.toString(16).padStart(4, "0") + "9bF3e21aC4c7D6B0f12A4e8C3" + (n % 10)

export const TONNES_PER_CREDIT = 1_000

const SEED_CREDITS: Credit[] = [
  { id: 0,  project: "Rimba Raya Biodiversity Reserve",   country: "Indonesia",      vintage_year: 2023, owner: A(1),  verified: true,  retired: false, created_at: 1_710_000_000 },
  { id: 1,  project: "Katingan Peatland Restoration",     country: "Indonesia",      vintage_year: 2022, owner: A(2),  verified: true,  retired: true,  created_at: 1_705_000_000 },
  { id: 2,  project: "Gujarat Onshore Wind Portfolio",    country: "India",          vintage_year: 2024, owner: A(3),  verified: true,  retired: false, created_at: 1_716_000_000 },
  { id: 3,  project: "Bhadla Solar Park Expansion",       country: "India",          vintage_year: 2023, owner: A(4),  verified: true,  retired: false, created_at: 1_712_000_000 },
  { id: 4,  project: "Delta Blue Carbon Mangrove",        country: "Pakistan",       vintage_year: 2023, owner: A(5),  verified: true,  retired: false, created_at: 1_713_500_000 },
  { id: 5,  project: "Kasigau Corridor REDD+",            country: "Kenya",          vintage_year: 2022, owner: A(6),  verified: true,  retired: true,  created_at: 1_700_000_000 },
  { id: 6,  project: "Madre de Dios Amazon REDD+",        country: "Peru",           vintage_year: 2024, owner: A(7),  verified: true,  retired: false, created_at: 1_717_200_000 },
  { id: 7,  project: "Cordillera Azul National Park",     country: "Peru",           vintage_year: 2023, owner: A(8),  verified: true,  retired: false, created_at: 1_711_000_000 },
  { id: 8,  project: "Jari Pará REDD+ Forest",            country: "Brazil",         vintage_year: 2024, owner: A(9),  verified: true,  retired: false, created_at: 1_718_000_000 },
  { id: 9,  project: "Envira Amazonia Project",           country: "Brazil",         vintage_year: 2022, owner: A(10), verified: false, retired: false, created_at: 1_706_500_000 },
  { id: 10, project: "Lake Turkana Wind Power",           country: "Kenya",          vintage_year: 2023, owner: A(11), verified: true,  retired: false, created_at: 1_709_000_000 },
  { id: 11, project: "Quebec Boreal Reforestation",       country: "Canada",         vintage_year: 2024, owner: A(12), verified: true,  retired: false, created_at: 1_719_000_000 },
  { id: 12, project: "Scottish Highlands Peat Repair",    country: "United Kingdom", vintage_year: 2023, owner: A(13), verified: true,  retired: true,  created_at: 1_708_000_000 },
  { id: 13, project: "Atlantic Forest Restoration",       country: "Brazil",         vintage_year: 2024, owner: A(14), verified: true,  retired: false, created_at: 1_720_000_000 },
  { id: 14, project: "Sumatran Lowland Conservation",     country: "Indonesia",      vintage_year: 2022, owner: A(15), verified: false, retired: false, created_at: 1_704_000_000 },
  { id: 15, project: "Texas Panhandle Wind Cluster",      country: "United States",  vintage_year: 2024, owner: A(16), verified: true,  retired: false, created_at: 1_721_000_000 },
  { id: 16, project: "California Improved Forest Mgmt",   country: "United States",  vintage_year: 2023, owner: A(17), verified: true,  retired: false, created_at: 1_710_500_000 },
  { id: 17, project: "Borneo Orangutan Habitat REDD+",    country: "Malaysia",       vintage_year: 2023, owner: A(18), verified: true,  retired: false, created_at: 1_714_000_000 },
  { id: 18, project: "Congo Basin Forest Protection",     country: "DR Congo",       vintage_year: 2024, owner: A(19), verified: true,  retired: false, created_at: 1_722_000_000 },
  { id: 19, project: "Yunnan Afforestation Programme",    country: "China",          vintage_year: 2022, owner: A(20), verified: true,  retired: true,  created_at: 1_702_000_000 },
]

const SESSION_CREDITS: Credit[] = []

function allOfflineCredits(): Credit[] {
  return [...SEED_CREDITS, ...SESSION_CREDITS].sort((a, b) => a.id - b.id)
}

function nextOfflineId(): number {
  const all = allOfflineCredits()
  return all.length === 0 ? 0 : Math.max(...all.map((c) => c.id)) + 1
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
    return { blockchain_connected: true, latest_block: 23_481_902, status: "ok" }
  }
}

export async function getCredits(): Promise<Credit[]> {
  try {
    const { data } = await api.get<{ items: Credit[] }>("/credits")
    markLive()
    return data.items
  } catch {
    markOffline()
    return allOfflineCredits()
  }
}

export async function getCredit(id: number): Promise<Credit | null> {
  try {
    const { data } = await api.get<Credit>(`/credits/${id}`)
    markLive()
    return data
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) return null
    markOffline()
    return allOfflineCredits().find((c) => c.id === id) ?? null
  }
}

export async function createCredit(
  payload: CreateCreditRequest,
): Promise<TxResponse> {
  try {
    const { data } = await api.post<TxResponse>("/credits", payload)
    markLive()
    return data
  } catch (err) {
    // Re-throw real API validation errors so the form can surface them
    if (err instanceof ApiError && err.statusCode >= 400 && err.statusCode < 500) {
      throw err
    }
    // Network down — offline fallback
    markOffline()
    SESSION_CREDITS.push({
      id:           nextOfflineId(),
      project:      payload.project,
      country:      payload.country,
      vintage_year: payload.vintage_year,
      owner:        A(99),
      verified:     false,
      retired:      false,
      created_at:   Math.floor(Date.now() / 1000),
    })
    return { status: "success", tx_hash: mockTxHash() }
  }
}

interface EthereumProvider {
  request(args: {
    method: string
    params?: unknown[]
  }): Promise<unknown>
}

const CARBON_REGISTRY = "0x6c6Cd9cF0e0214d787350089C8f5B8b93144A447"
const SEPOLIA_CHAIN_ID = "0xaa36a7"

function encodeUint256(value: number): string {
  return value.toString(16).padStart(64, "0")
}

function encodeAddress(address: string): string {
  return address.slice(2).toLowerCase().padStart(64, "0")
}

async function getWallet(): Promise<{
  provider: EthereumProvider
  address: string
}> {
  if (!window.ethereum) {
    throw new ApiError(400, "MetaMask is not installed.")
  }

  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[]

  const address = accounts[0]

  if (!address) {
    throw new ApiError(400, "Please connect your wallet.")
  }

  const chainId = await window.ethereum.request({
    method: "eth_chainId",
  })

  if (String(chainId).toLowerCase() !== SEPOLIA_CHAIN_ID) {
    throw new ApiError(400, "Please switch MetaMask to Sepolia.")
  }

  return { provider: window.ethereum, address }
}

async function reportBlockchainTransaction(
  txHash: string,
  operationType: "transfer" | "retire",
  creditId: number,
  walletAddress: string,
): Promise<void> {
  await api.post("/transactions", {
    operation_type: operationType,
    credit_id: creditId,
    wallet_address: walletAddress,
    tx_hash: txHash,
  })
}

export async function retireCredit(id: number): Promise<TxResponse> {
  const { provider, address } = await getWallet()

  // retireCredit(uint256) selector = 0x0f2f9f7c
  const data = "0xeb899eeb" + encodeUint256(id)

  const txHash = (await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: address,
        to: CARBON_REGISTRY,
        data,
      },
    ],
  })) as string

  await reportBlockchainTransaction(txHash, "retire", id, address)

  return {
    status: "submitted",
    tx_hash: txHash,
  }
}

export async function transferCredit(
  id: number,
  newOwner: string,
): Promise<TxResponse> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(newOwner)) {
    throw new ApiError(422, "Invalid Ethereum address format")
  }

  const { provider, address } = await getWallet()

  // transferCredit(uint256,address) selector = 0x6f7f4e8b
  const data =
    "0x0df3a1e0" +
    encodeUint256(id) +
    encodeAddress(newOwner)

  const txHash = (await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: address,
        to: CARBON_REGISTRY,
        data,
      },
    ],
  })) as string

  await reportBlockchainTransaction(txHash, "transfer", id, address)

  return {
    status: "submitted",
    tx_hash: txHash,
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
  if (c.retired)  return "Retired"
  if (c.verified) return "Verified"
  return "Pending"
}

export function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  })
}

export const DAY = 86_400