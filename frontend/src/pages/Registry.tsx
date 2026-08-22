import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Activity,
  Globe2,
  Layers,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { useCredits, usePageTitle } from "../hooks"
import {
  creditStatus,
  formatCompact,
  formatNumber,
  shortAddress,
  type Credit,
} from "../api"
import { categoryOf, volumeOf, type Category } from "../stats"
import CreditCard from "../components/CreditCard"
import PageHeader from "../components/PageHeader"
import { StatusPill } from "../components/ui"

type StatusFilter = "All" | "Verified" | "Retired" | "Pending"
type SortKey = "newest" | "oldest" | "vintage" | "volume"

const STATUS_FILTERS: StatusFilter[] = ["All", "Verified", "Retired", "Pending"]
const CATEGORIES: (Category | "All")[] = [
  "All",
  "Forest Conservation",
  "Reforestation",
  "Renewable Energy",
  "Blue Carbon",
  "Peatland",
]

export default function Registry() {
  usePageTitle("Registry")
  const { credits, loading, live } = useCredits()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("All")
  const [category, setCategory] = useState<Category | "All">("All")
  const [sort, setSort] = useState<SortKey>("newest")
  const [view, setView] = useState<"table" | "grid">("table")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...credits]
      .filter((c) => {
        const matchesQuery =
          !q ||
          c.project.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.id.toString() === q
        return (
          matchesQuery &&
          (status === "All" || creditStatus(c) === status) &&
          (category === "All" || categoryOf(c.project) === category)
        )
      })
      .sort((a, b) => {
        if (sort === "oldest") return a.created_at - b.created_at
        if (sort === "vintage") return b.vintage_year - a.vintage_year
        if (sort === "volume") return volumeOf(b) - volumeOf(a)
        return b.created_at - a.created_at
      })
  }, [credits, query, status, category, sort])

  const summary = useMemo(() => {
    const volume = filtered.reduce((sum, c) => sum + volumeOf(c), 0)
    const projects = new Set(filtered.map((c) => c.project)).size
    const countries = new Set(filtered.map((c) => c.country)).size
    return { volume, projects, countries }
  }, [filtered])

  const hasActiveFilters = query !== "" || status !== "All" || category !== "All"
  const clearFilters = () => {
    setQuery("")
    setStatus("All")
    setCategory("All")
  }

  return (
    <div className="min-h-screen bg-ink">
      <PageHeader
        eyebrow="Verra-style Registry Explorer"
        title="Registry Explorer"
        intro="Search every Endeavour credit by project, country, vintage, verification state and current ownership."
      >
        <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-ink px-4 py-2.5 shadow-sm">
          <span className={`pulse-dot h-2 w-2 rounded-full ${live ? "bg-emerald" : "bg-amber-400"}`} />
          <span className="text-sm font-medium text-mute">
            {live ? "Live Endeavour data" : "Registry snapshot"}
          </span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {!loading && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <SummaryCard icon={<Activity />} label="Filtered Volume" value={`${formatCompact(summary.volume)} tCO2e`} />
            <SummaryCard icon={<Layers />} label="Projects Listed" value={formatNumber(summary.projects)} />
            <SummaryCard icon={<Globe2 />} label="Countries" value={formatNumber(summary.countries)} />
          </div>
        )}

        <div className="rounded-3xl border border-line bg-ink-2 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mute" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search project, country, or credit ID"
                className="w-full rounded-xl border border-line bg-ink py-3.5 pl-12 pr-4 text-paper outline-none transition placeholder:text-mute focus:border-emerald/50 focus:ring-4 focus:ring-emerald/10"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-line bg-ink px-4 py-3">
                <SlidersHorizontal className="h-4 w-4 text-mute" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-transparent text-sm font-medium text-paper outline-none"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="vintage">Vintage year</option>
                  <option value="volume">Volume high to low</option>
                </select>
              </label>
              <div className="flex overflow-hidden rounded-xl border border-line bg-ink">
                <button
                  onClick={() => setView("table")}
                  aria-label="Table view"
                  className={`p-3 ${view === "table" ? "bg-emerald/10 text-emerald-deep" : "text-mute hover:text-paper"}`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView("grid")}
                  aria-label="Card view"
                  className={`p-3 ${view === "grid" ? "bg-emerald/10 text-emerald-deep" : "text-mute hover:text-paper"}`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((item) => (
              <FilterButton key={item} active={status === item} onClick={() => setStatus(item)}>
                {item}
              </FilterButton>
            ))}
            <span className="mx-1 h-6 w-px bg-line" />
            {CATEGORIES.map((item) => (
              <FilterButton key={item} active={category === item} onClick={() => setCategory(item)}>
                {item}
              </FilterButton>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-mute transition hover:bg-ink hover:text-paper"
              >
                <X className="h-4 w-4" /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[340px] animate-pulse rounded-2xl border border-line bg-ink-2" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : view === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((credit) => <CreditCard key={credit.id} credit={credit} />)}
            </div>
          ) : (
            <RegistryTable credits={filtered} />
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-ink p-5 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/10 text-emerald-deep [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-mute">{label}</p>
        <p className="mt-1 font-mono text-xl font-semibold text-paper">{value}</p>
      </div>
    </div>
  )
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-emerald/40 bg-emerald/10 text-emerald-deep"
          : "border-line bg-ink text-mute hover:border-line-2 hover:text-paper"
      }`}
    >
      {children}
    </button>
  )
}

function RegistryTable({ credits }: { credits: Credit[] }) {
  return (
    <div className="thin-scroll overflow-x-auto rounded-2xl border border-line bg-ink shadow-sm">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="bg-ink-2 text-left text-xs font-semibold uppercase tracking-wider text-mute">
          <tr>
            <th className="px-6 py-5">Credit ID</th>
            <th className="px-6 py-5">Project</th>
            <th className="px-6 py-5">Category</th>
            <th className="px-6 py-5">Country</th>
            <th className="px-6 py-5 text-right">Vintage</th>
            <th className="px-6 py-5 text-right">Volume</th>
            <th className="px-6 py-5">Owner</th>
            <th className="px-6 py-5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {credits.map((credit) => (
            <tr key={credit.id} className="transition hover:bg-emerald/5">
              <td className="px-6 py-4 font-mono text-mute">#{credit.id.toString().padStart(4, "0")}</td>
              <td className="px-6 py-4">
                <Link to={`/credit/${credit.id}`} className="font-semibold text-paper transition hover:text-emerald-deep">
                  {credit.project}
                </Link>
              </td>
              <td className="px-6 py-4 text-mute">{categoryOf(credit.project)}</td>
              <td className="px-6 py-4 text-mute">{credit.country}</td>
              <td className="px-6 py-4 text-right font-mono text-paper">{credit.vintage_year}</td>
              <td className="px-6 py-4 text-right font-mono font-semibold text-paper">{formatNumber(volumeOf(credit))}</td>
              <td className="px-6 py-4 font-mono text-mute">{shortAddress(credit.owner)}</td>
              <td className="px-6 py-4"><StatusPill credit={credit} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-ink-2 py-28 text-center">
      <Search className="h-10 w-10 text-mute" />
      <h3 className="mt-5 text-xl font-bold text-paper">No records found</h3>
      <p className="mt-2 max-w-sm text-mute">
        Adjust your search or remove filters to expand the registry scope.
      </p>
      <button onClick={onClear} className="mt-7 rounded-lg bg-emerald px-5 py-3 font-semibold text-white hover:bg-emerald-deep">
        Reset Filters
      </button>
    </div>
  )
}
