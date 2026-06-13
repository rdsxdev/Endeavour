import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Search, SlidersHorizontal, LayoutGrid, List, X } from "lucide-react"
import { useCredits } from "../hooks"
import {
  creditStatus,
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
  const { credits, loading, live } = useCredits()

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("All")
  const [category, setCategory] = useState<Category | "All">("All")
  const [sort, setSort] = useState<SortKey>("newest")
  const [view, setView] = useState<"grid" | "table">("grid")

  const filtered = useMemo(() => {
    let list = credits.filter((c) => {
      const q = query.trim().toLowerCase()
      const matchQuery =
        !q ||
        c.project.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.id.toString() === q
      const matchStatus = status === "All" || creditStatus(c) === status
      const matchCategory =
        category === "All" || categoryOf(c.project) === category
      return matchQuery && matchStatus && matchCategory
    })

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.created_at - a.created_at
        case "oldest":
          return a.created_at - b.created_at
        case "vintage":
          return b.vintage_year - a.vintage_year
        case "volume":
          return volumeOf(b) - volumeOf(a)
      }
    })
    return list
  }, [credits, query, status, category, sort])

  const hasActiveFilters =
    query !== "" || status !== "All" || category !== "All"

  function clearFilters() {
    setQuery("")
    setStatus("All")
    setCategory("All")
  }

  return (
    <>
      <PageHeader
        eyebrow="On-Chain Registry"
        title="Registry Explorer"
        intro="Every carbon credit issued on Endeavour, searchable and independently auditable. Inspect provenance, ownership and retirement status in real time."
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
        {/* Toolbar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by project, country or credit ID…"
                className="w-full rounded-lg border border-line bg-ink-2 py-3 pl-11 pr-4 text-paper outline-none transition-colors placeholder:text-mute focus:border-emerald/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-ink-2 px-3 py-2.5">
                <SlidersHorizontal className="h-4 w-4 text-mute" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="bg-transparent text-sm text-paper outline-none"
                >
                  <option value="newest" className="bg-ink-2">
                    Newest first
                  </option>
                  <option value="oldest" className="bg-ink-2">
                    Oldest first
                  </option>
                  <option value="vintage" className="bg-ink-2">
                    Vintage (newest)
                  </option>
                  <option value="volume" className="bg-ink-2">
                    Volume (high → low)
                  </option>
                </select>
              </div>

              <div className="flex overflow-hidden rounded-lg border border-line">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={`p-2.5 transition-colors ${view === "grid" ? "bg-emerald/15 text-emerald-bright" : "bg-ink-2 text-mute hover:text-paper"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("table")}
                  aria-label="Table view"
                  className={`p-2.5 transition-colors ${view === "table" ? "bg-emerald/15 text-emerald-bright" : "bg-ink-2 text-mute hover:text-paper"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  status === s
                    ? "border-emerald/40 bg-emerald/15 text-emerald-bright"
                    : "border-line bg-ink-2 text-mute hover:text-paper"
                }`}
              >
                {s}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-line" />
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  category === c
                    ? "border-emerald/40 bg-emerald/15 text-emerald-bright"
                    : "border-line bg-ink-2 text-mute hover:text-paper"
                }`}
              >
                {c}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-mute hover:text-paper"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        <p className="mt-6 text-sm text-mute">
          {loading
            ? "Loading registry…"
            : `${formatNumber(filtered.length)} ${filtered.length === 1 ? "credit" : "credits"}`}
        </p>

        {/* Results */}
        <div className="mt-5">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-line bg-ink-2"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : view === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CreditCard key={c.id} credit={c} />
              ))}
            </div>
          ) : (
            <RegistryTable credits={filtered} />
          )}
        </div>
      </div>
    </>
  )
}

function RegistryTable({ credits }: { credits: Credit[] }) {
  return (
    <div className="thin-scroll overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-ink-2 text-left text-mute">
            <th className="px-5 py-4 font-medium">ID</th>
            <th className="px-5 py-4 font-medium">Project</th>
            <th className="px-5 py-4 font-medium">Category</th>
            <th className="px-5 py-4 font-medium">Country</th>
            <th className="px-5 py-4 font-medium">Vintage</th>
            <th className="px-5 py-4 font-medium">Volume</th>
            <th className="px-5 py-4 font-medium">Owner</th>
            <th className="px-5 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {credits.map((c) => (
            <tr
              key={c.id}
              className="border-b border-line/60 transition-colors last:border-0 hover:bg-ink-2"
            >
              <td className="px-5 py-4 font-mono text-mute">
                #{c.id.toString().padStart(4, "0")}
              </td>
              <td className="px-5 py-4">
                <Link
                  to={`/credit/${c.id}`}
                  className="font-medium text-paper hover:text-emerald-bright"
                >
                  {c.project}
                </Link>
              </td>
              <td className="px-5 py-4 text-mute">{categoryOf(c.project)}</td>
              <td className="px-5 py-4 text-mute">{c.country}</td>
              <td className="px-5 py-4 font-mono text-paper">
                {c.vintage_year}
              </td>
              <td className="px-5 py-4 font-mono text-paper">
                {formatNumber(volumeOf(c))}
              </td>
              <td className="px-5 py-4 font-mono text-mute">
                {shortAddress(c.owner)}
              </td>
              <td className="px-5 py-4">
                <StatusPill credit={c} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-ink-2 py-20 text-center">
      <Search className="h-8 w-8 text-mute" />
      <h3 className="mt-4 text-lg font-semibold text-paper">
        No matching credits
      </h3>
      <p className="mt-1 max-w-sm text-sm text-mute">
        Try adjusting your search or filters to find what you&apos;re looking
        for.
      </p>
      <button
        onClick={onClear}
        className="mt-5 rounded-lg border border-line-2 px-4 py-2 text-sm text-paper hover:bg-ink-3"
      >
        Clear filters
      </button>
    </div>
  )
}
