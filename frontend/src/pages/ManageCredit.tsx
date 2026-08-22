import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { usePageTitle } from "../hooks"
import { POOLS, poolColor } from "../pools"
import { formatCompact } from "../api"
import PageHeader from "../components/PageHeader"
import Reveal from "../components/Reveal"
import AreaChart from "../components/AreaChart"
import Sparkline from "../components/Sparkline"

const PORTFOLIO = [
  { id: "4920", project: "Rimba Raya Biodiversity", pool: "bio" as const, volume: 25000, status: "Active", vintage: 2023 },
  { id: "4921", project: "Keo Seima Wildlife", pool: "bio" as const, volume: 10000, status: "Active", vintage: 2022 },
  { id: "4810", project: "Solar Farm Rajasthan", pool: "carbon" as const, volume: 5000, status: "Retired", vintage: 2021 },
  { id: "4755", project: "UK Green Gilt 2030", pool: "bond" as const, volume: 500000, status: "Active", vintage: 2024 },
]

export default function ManageCredit() {
  usePageTitle("Portfolio")
  const [activeTab, setActiveTab] = useState<"holdings" | "history">("holdings")

  const activeVolume = PORTFOLIO.filter((p) => p.status === "Active").reduce((s, p) => s + p.volume, 0)
  const retiredVolume = PORTFOLIO.filter((p) => p.status === "Retired").reduce((s, p) => s + p.volume, 0)

  const poolBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of PORTFOLIO.filter((a) => a.status === "Active")) {
      map.set(p.pool, (map.get(p.pool) ?? 0) + p.volume)
    }
    return [...map.entries()]
  }, [])

  const filtered = PORTFOLIO.filter((p) =>
    activeTab === "holdings" ? p.status === "Active" : p.status === "Retired",
  )

  return (
    <>
      <PageHeader
        eyebrow="Institutional portfolio"
        title="Manage"
        intro="Holdings across CarbonPool, BioPool, and Green Bond Vault — transfer, retire, or issue new credits."
      >
        <div className="surface px-4 py-2.5 font-mono text-sm text-paper">
          0x8F9a…2B4c
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Reveal>
            <div className="surface p-6">
              <p className="label">Active volume</p>
              <p className="mt-2 font-mono text-3xl text-paper">
                {activeVolume.toLocaleString()}
                <span className="ml-1 text-base text-mute">units</span>
              </p>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="surface p-6">
              <p className="label">Retired</p>
              <p className="mt-2 font-mono text-3xl text-paper">
                {retiredVolume.toLocaleString()}
                <span className="ml-1 text-base text-mute">tCO₂e</span>
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Link
              to="/create"
              className="flex h-full min-h-[100px] items-center justify-center border border-emerald bg-emerald/8 text-sm font-semibold text-emerald-deep transition hover:bg-emerald/12"
            >
              Issue new credits →
            </Link>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="surface p-6">
              <h3 className="font-serif text-lg text-paper">Pool allocation</h3>
              <p className="mt-1 text-sm text-mute">Active holdings by token pool</p>
              <div className="mt-6 space-y-4">
                {poolBreakdown.map(([kind, vol]) => {
                  const pool = POOLS.find((p) => p.kind === kind)
                  const color = poolColor(kind as "carbon" | "bio" | "bond")
                  const pct = Math.round((vol / activeVolume) * 100)
                  return (
                    <div key={kind}>
                      <div className="flex justify-between text-sm">
                        <span className="font-mono text-mute">{pool?.symbol}</span>
                        <span className="text-paper">{formatCompact(vol)} ({pct}%)</span>
                      </div>
                      <div className="mt-2 h-2 bg-ink-3">
                        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="surface p-6">
              <h3 className="font-serif text-lg text-paper">BioPool trend</h3>
              <AreaChart
                data={POOLS[1]!.trend.map((v, i) => ({
                  label: ["J", "F", "M", "A", "M", "J"][i] ?? "",
                  value: v,
                }))}
                color="var(--color-pool-bio)"
                height={140}
              />
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-8">
          <div className="flex gap-6 border-b border-line">
            {(["holdings", "history"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? "border-b-2 border-emerald text-emerald-deep"
                    : "text-mute hover:text-paper"
                }`}
              >
                {tab === "holdings" ? "Current holdings" : "Transaction history"}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={60} className="mt-4">
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-ink-2 text-xs uppercase tracking-wider text-mute">
                <tr>
                  <th className="px-5 py-4 font-medium">ID</th>
                  <th className="px-5 py-4 font-medium">Project</th>
                  <th className="px-5 py-4 font-medium">Pool</th>
                  <th className="px-5 py-4 font-medium">Vintage</th>
                  <th className="px-5 py-4 font-medium">Volume</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((asset) => {
                  const pool = POOLS.find((p) => p.kind === asset.pool)
                  return (
                    <tr key={asset.id} className="hover:bg-ink-2">
                      <td className="px-5 py-3.5 font-mono text-mute">#{asset.id}</td>
                      <td className="px-5 py-3.5 font-medium text-paper">{asset.project}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2 font-mono text-xs">
                          <Sparkline data={pool?.trend ?? []} color={poolColor(asset.pool)} width={48} height={20} />
                          {pool?.symbol}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">{asset.vintage}</td>
                      <td className="px-5 py-3.5 font-mono">{asset.volume.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium uppercase tracking-wide ${
                          asset.status === "Active" ? "text-emerald-deep" : "text-mute"
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {asset.status === "Active" ? (
                          <div className="flex justify-end gap-2">
                            <button type="button" className="border border-line px-3 py-1 text-xs hover:bg-ink-2">
                              Transfer
                            </button>
                            <button type="button" className="border border-line px-3 py-1 text-xs text-amber hover:bg-ink-2">
                              Retire
                            </button>
                          </div>
                        ) : (
                          <Link to={`/credit/${asset.id}`} className="text-xs text-emerald-deep hover:text-emerald">
                            Certificate →
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </>
  )
}
