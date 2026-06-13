import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Activity,
  Globe2,
  Layers,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Flame,
  ArrowUpRight,
} from "lucide-react"
import { useCredits } from "../hooks"
import { computeStats, categoryOf, volumeOf } from "../stats"
import {
  formatNumber,
  formatCompact,
  creditStatus,
  shortAddress,
  type Credit,
} from "../api"
import PageHeader from "../components/PageHeader.tsx"
import { Panel } from "../components/ui.tsx"

type BlockchainHealth = {
  blockchain_connected?: boolean
  latest_block?: number
}

export default function Analytics() {
  const { credits: rawCredits, loading } = useCredits()
  const credits = (rawCredits ?? []) as Credit[]
  const live = false
  const health: BlockchainHealth = {}
  const stats = useMemo(() => computeStats(credits), [credits])

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of credits) {
      const cat = categoryOf(c.project)
      map.set(cat, (map.get(cat) ?? 0) + volumeOf(c))
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [credits])

  const byCountry = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of credits) {
      map.set(c.country, (map.get(c.country) ?? 0) + volumeOf(c))
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [credits])

  const byVintage = useMemo(() => {
    const map = new Map<number, number>()
    for (const c of credits) {
      map.set(c.vintage_year, (map.get(c.vintage_year) ?? 0) + volumeOf(c))
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [credits])

  const recent = useMemo(
    () => [...credits].sort((a, b) => b.created_at - a.created_at).slice(0, 6),
    [credits],
  )

  const categoryColors = [
    "var(--color-emerald-bright)",
    "var(--color-emerald)",
    "#0ea5e9",
    "#6366f1",
    "#f59e0b",
  ]

  return (
    <>
      <PageHeader
        eyebrow="ESG Analytics"
        title="Analytics Dashboard"
        intro="Portfolio-grade intelligence on the entire Endeavour registry — issuance, verification quality, retirements and geographic exposure, computed live from on-chain data."
      >
        <div className="flex items-center gap-2 rounded-lg border border-line bg-ink px-4 py-3">
          <span
            className={`pulse-dot h-2 w-2 rounded-full ${live ? "bg-emerald-bright" : "bg-amber-400"}`}
          />
          <span className="text-sm text-mute">
            {live ? "Live chain data" : "Registry snapshot"}
          </span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi
            icon={<Layers className="h-5 w-5" />}
            label="Total Credits Issued"
            value={loading ? "—" : formatNumber(stats.totalCredits)}
            sub={`${formatCompact(stats.tonnesOffset)} tCO₂e represented`}
          />
          <Kpi
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Verified Credits"
            value={loading ? "—" : `${stats.verifiedPct}%`}
            sub={`${formatNumber(stats.verifiedCredits)} independently verified`}
            accent
          />
          <Kpi
            icon={<Flame className="h-5 w-5" />}
            label="Retired Credits"
            value={loading ? "—" : formatNumber(stats.retiredCredits)}
            sub={`${formatCompact(stats.tonnesRetired)} tCO₂e permanently offset`}
          />
          <Kpi
            icon={<Globe2 className="h-5 w-5" />}
            label="Active Projects"
            value={loading ? "—" : formatNumber(stats.activeProjects)}
            sub={`${stats.countries} countries`}
          />
        </div>

        {/* Charts grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Issuance by vintage */}
          <Panel className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-paper">
                  Issuance by Vintage
                </h3>
                <p className="mt-1 text-sm text-mute">
                  Volume of credits issued per vintage year (tCO₂e)
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-bright" />
            </div>
            <VintageChart data={byVintage} loading={loading} />
          </Panel>

          {/* Category breakdown */}
          <Panel className="p-6">
            <h3 className="text-lg font-semibold text-paper">
              Methodology Mix
            </h3>
            <p className="mt-1 text-sm text-mute">Volume by project type</p>
            <div className="mt-6 flex flex-col gap-4">
              {byCategory.map(([cat, vol], i) => {
                const total = byCategory.reduce((s, [, v]) => s + v, 0) || 1
                const pct = Math.round((vol / total) * 100)
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-paper">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{
                            background:
                              categoryColors[i % categoryColors.length],
                          }}
                        />
                        {cat}
                      </span>
                      <span className="font-mono text-mute">{pct}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-3">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background:
                            categoryColors[i % categoryColors.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>

        {/* Geography + Blockchain status */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Panel className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-paper">
              Geographic Exposure
            </h3>
            <p className="mt-1 text-sm text-mute">
              Top issuing jurisdictions by credit volume
            </p>
            <div className="mt-6 flex flex-col gap-3.5">
              {byCountry.map(([country, vol]) => {
                const max = byCountry[0]?.[1] || 1
                const pct = Math.round((vol / max) * 100)
                return (
                  <div key={country} className="flex items-center gap-4">
                    <span className="w-36 shrink-0 truncate text-sm text-paper">
                      {country}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-deep to-emerald-bright transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right font-mono text-xs text-mute">
                      {formatCompact(vol)}
                    </span>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-bright" />
              <h3 className="text-lg font-semibold text-paper">
                Blockchain Status
              </h3>
            </div>
            <dl className="mt-6 flex flex-col gap-4 text-sm">
              <StatusRow
                label="Network"
                value="Endeavour L2"
                ok={health?.blockchain_connected ?? true}
              />
              <StatusRow
                label="Consensus"
                value={
                  (health?.blockchain_connected ?? true)
                    ? "Connected"
                    : "Degraded"
                }
                ok={health?.blockchain_connected ?? true}
              />
              <div className="flex items-center justify-between border-t border-line pt-4">
                <dt className="text-mute">Latest block</dt>
                <dd className="font-mono text-paper">
                  #{formatNumber(health?.latest_block ?? 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-mute">Data source</dt>
                <dd className="font-mono text-paper">
                  {live ? "Live RPC" : "Snapshot"}
                </dd>
              </div>
            </dl>
            <div className="mt-6 rounded-xl border border-emerald/20 bg-emerald/5 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-bright">
                <Leaf className="h-4 w-4" />
                Net climate impact
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold text-paper">
                {formatCompact(stats.tonnesRetired)}
                <span className="ml-1 text-sm text-mute">tCO₂e retired</span>
              </p>
            </div>
          </Panel>
        </div>

        {/* Recent transactions */}
        <Panel className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-paper">
              Recent Registry Activity
            </h3>
            <Link
              to="/registry"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-bright hover:text-emerald"
            >
              View registry <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="thin-scroll mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-mute">
                  <th className="py-3 pr-4 font-medium">Credit</th>
                  <th className="py-3 pr-4 font-medium">Project</th>
                  <th className="py-3 pr-4 font-medium">Owner</th>
                  <th className="py-3 pr-4 font-medium">Volume</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <ActivityRow key={c.id} credit={c} />
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  )
}

function Kpi({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${accent ? "border-emerald/30 bg-emerald/5" : "border-line bg-ink-2"}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? "bg-emerald/15 text-emerald-bright" : "bg-ink-3 text-mute"}`}
      >
        {icon}
      </div>
      <p className="mt-4 font-mono text-3xl font-semibold text-paper">{value}</p>
      <p className="mt-1 text-sm font-medium text-paper">{label}</p>
      <p className="mt-1 text-xs text-mute">{sub}</p>
    </div>
  )
}

function VintageChart({
  data,
  loading,
}: {
  data: [number, number][]
  loading: boolean
}) {
  const max = Math.max(...data.map(([, v]) => v), 1)
  if (loading) {
    return <div className="mt-8 h-56 animate-pulse rounded-xl bg-ink-3" />
  }
  return (
    <div className="mt-8 flex h-56 items-end gap-4">
      {data.map(([year, vol]) => {
        const h = Math.max((vol / max) * 100, 4)
        return (
          <div
            key={year}
            className="group flex flex-1 flex-col items-center gap-2"
          >
            <span className="font-mono text-xs text-mute opacity-0 transition-opacity group-hover:opacity-100">
              {formatCompact(vol)}
            </span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-emerald-deep to-emerald-bright transition-all duration-700"
              style={{ height: `${h}%` }}
            />
            <span className="font-mono text-xs text-mute">{year}</span>
          </div>
        )
      })}
    </div>
  )
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string
  value: string
  ok: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-mute">{label}</dt>
      <dd className="flex items-center gap-2 text-paper">
        <span
          className={`pulse-dot h-2 w-2 rounded-full ${ok ? "bg-emerald-bright" : "bg-amber-400"}`}
        />
        {value}
      </dd>
    </div>
  )
}

function ActivityRow({ credit }: { credit: Credit }) {
  const status = creditStatus(credit)
  const verb =
    status === "Retired"
      ? "Retired"
      : status === "Verified"
        ? "Verified"
        : "Issued"
  return (
    <tr className="border-b border-line/60 last:border-0">
      <td className="py-3.5 pr-4">
        <Link
          to={`/credit/${credit.id}`}
          className="font-mono text-mute hover:text-emerald-bright"
        >
          #{credit.id.toString().padStart(4, "0")}
        </Link>
      </td>
      <td className="py-3.5 pr-4 text-paper">{credit.project}</td>
      <td className="py-3.5 pr-4 font-mono text-mute">
        {shortAddress(credit.owner)}
      </td>
      <td className="py-3.5 pr-4 font-mono text-paper">
        {formatNumber(volumeOf(credit))}
      </td>
      <td className="py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${
            verb === "Retired"
              ? "bg-sky-500/10 text-sky-300"
              : verb === "Verified"
                ? "bg-emerald/10 text-emerald-bright"
                : "bg-amber-500/10 text-amber-300"
          }`}
        >
          {verb}
        </span>
      </td>
    </tr>
  )
}
