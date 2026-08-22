import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useCredits, usePageTitle } from "../hooks";
import {
  creditStatus,
  formatCompact,
  formatNumber,
  shortAddress,
  type Credit,
} from "../api";
import { categoryOf, volumeOf, type Category } from "../stats";
import { POOLS, type PoolKind } from "../pools";
import { poolForCredit } from "../lib/poolForCredit";
import CreditCard from "../components/CreditCard";
import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import { StatusPill } from "../components/ui";
import heroForest from "../assets/hero-forest.jpg";

type StatusFilter = "All" | "Verified" | "Retired" | "Pending";
type SortKey = "newest" | "oldest" | "vintage" | "volume";
type PoolFilter = "All" | PoolKind;

const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "Verified",
  "Retired",
  "Pending",
];
const POOL_FILTERS: { key: PoolFilter; label: string }[] = [
  { key: "All", label: "All pools" },
  { key: "carbon", label: "CarbonPool" },
  { key: "bio", label: "BioPool" },
  { key: "bond", label: "Green Bond" },
];
const CATEGORIES: (Category | "All")[] = [
  "All",
  "Forest Conservation",
  "Reforestation",
  "Renewable Energy",
  "Blue Carbon",
  "Peatland",
];

export default function Registry() {
  usePageTitle("Registry");
  const { credits, loading, live } = useCredits();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [category, setCategory] = useState<Category | "All">("All");
  const [pool, setPool] = useState<PoolFilter>("All");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"table" | "grid">("table");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...credits]
      .filter((c) => {
        const matchesQuery =
          !q ||
          c.project.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.id.toString() === q;
        return (
          matchesQuery &&
          (status === "All" || creditStatus(c) === status) &&
          (category === "All" || categoryOf(c.project) === category) &&
          (pool === "All" || poolForCredit(c) === pool)
        );
      })
      .sort((a, b) => {
        if (sort === "oldest") return a.created_at - b.created_at;
        if (sort === "vintage") return b.vintage_year - a.vintage_year;
        if (sort === "volume") return volumeOf(b) - volumeOf(a);
        return b.created_at - a.created_at;
      });
  }, [credits, query, status, category, pool, sort]);

  const summary = useMemo(() => {
    const volume = filtered.reduce((sum, c) => sum + volumeOf(c), 0);
    const projects = new Set(filtered.map((c) => c.project)).size;
    const countries = new Set(filtered.map((c) => c.country)).size;
    return { volume, projects, countries };
  }, [filtered]);

  const hasActiveFilters =
    query !== "" || status !== "All" || category !== "All" || pool !== "All";
  const clearFilters = () => {
    setQuery("");
    setStatus("All");
    setCategory("All");
    setPool("All");
  };

  return (
    <div className="min-h-screen bg-ink">
      <PageHeader
        eyebrow="On-chain registry"
        title="Registry"
        intro="Search credits across CarbonPool, BioPool, and Green Bond Vault — filter by project, jurisdiction, vintage, and verification state."
        image={
          "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=3074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        imageAlt="Forest canopy aerial view"
      >
        <div className="surface flex items-center gap-2 px-4 py-2.5">
          <span
            className={`pulse-dot h-1.5 w-1.5 rounded-full ${live ? "bg-emerald" : "bg-amber"}`}
          />
          <span className="text-sm text-mute">
            {live ? "Live data" : "Snapshot"}
          </span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {!loading && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Reveal>
              <SummaryStat
                label="Filtered volume"
                value={`${formatCompact(summary.volume)} tCO₂e`}
              />
            </Reveal>
            <Reveal delay={60}>
              <SummaryStat
                label="Projects"
                value={formatNumber(summary.projects)}
              />
            </Reveal>
            <Reveal delay={120}>
              <SummaryStat
                label="Countries"
                value={formatNumber(summary.countries)}
              />
            </Reveal>
          </div>
        )}

        {/* Pool quick-nav */}
        <Reveal className="mb-6">
          <div className="flex flex-wrap gap-3">
            {POOLS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPool(p.kind)}
                className={`border px-4 py-2 text-left text-sm transition ${
                  pool === p.kind
                    ? "border-emerald bg-emerald/8 text-emerald-deep"
                    : "border-line bg-ink-2 text-mute hover:text-paper"
                }`}
              >
                <span className="font-mono text-xs">{p.symbol}</span>
                <span className="ml-2">{p.name}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="surface-inset p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search project, country, or credit ID"
                  className="input pl-11"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="input w-auto py-2.5 text-sm"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="vintage">Vintage year</option>
                  <option value="volume">Volume high → low</option>
                </select>
                <div className="flex border border-line">
                  {(["table", "grid"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={`px-4 py-2.5 text-sm capitalize ${
                        view === v
                          ? "bg-emerald/8 text-emerald-deep"
                          : "text-mute hover:text-paper"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {POOL_FILTERS.map(({ key, label }) => (
                <FilterChip
                  key={key}
                  active={pool === key}
                  onClick={() => setPool(key)}
                >
                  {label}
                </FilterChip>
              ))}
              <span className="mx-1 h-5 w-px bg-line" />
              {STATUS_FILTERS.map((item) => (
                <FilterChip
                  key={item}
                  active={status === item}
                  onClick={() => setStatus(item)}
                >
                  {item}
                </FilterChip>
              ))}
              <span className="mx-1 h-5 w-px bg-line" />
              {CATEGORIES.map((item) => (
                <FilterChip
                  key={item}
                  active={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </FilterChip>
              ))}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-1 text-sm text-mute hover:text-paper"
                >
                  <X className="h-3.5 w-3.5" /> Reset
                </button>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[320px] animate-pulse bg-ink-3" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : view === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((credit, i) => (
                <Reveal key={credit.id} delay={(i % 6) * 50}>
                  <CreditCard credit={credit} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <RegistryTable credits={filtered} />
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-5">
      <p className="label">{label}</p>
      <p className="mt-2 font-mono text-xl text-paper">{value}</p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-sm transition ${
        active
          ? "bg-paper text-ink"
          : "text-mute hover:bg-ink-3 hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}

function RegistryTable({ credits }: { credits: Credit[] }) {
  return (
    <div className="thin-scroll overflow-x-auto border border-line">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="bg-ink-2 text-left text-xs uppercase tracking-wider text-mute">
          <tr>
            <th className="px-5 py-4 font-medium">ID</th>
            <th className="px-5 py-4 font-medium">Project</th>
            <th className="px-5 py-4 font-medium">Pool</th>
            <th className="px-5 py-4 font-medium">Category</th>
            <th className="px-5 py-4 font-medium">Country</th>
            <th className="px-5 py-4 text-right font-medium">Vintage</th>
            <th className="px-5 py-4 text-right font-medium">Volume</th>
            <th className="px-5 py-4 font-medium">Owner</th>
            <th className="px-5 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {credits.map((credit) => (
            <tr key={credit.id} className="transition hover:bg-ink-2">
              <td className="px-5 py-3.5 font-mono text-mute">
                #{credit.id.toString().padStart(4, "0")}
              </td>
              <td className="px-5 py-3.5">
                <Link
                  to={`/credit/${credit.id}`}
                  className="font-medium text-paper hover:text-emerald-deep"
                >
                  {credit.project}
                </Link>
              </td>
              <td className="px-5 py-3.5 font-mono text-xs text-mute">
                {poolForCredit(credit) === "carbon"
                  ? "eCO₂"
                  : poolForCredit(credit) === "bio"
                    ? "eBIO"
                    : "eGBND"}
              </td>
              <td className="px-5 py-3.5 text-mute">
                {categoryOf(credit.project)}
              </td>
              <td className="px-5 py-3.5 text-mute">{credit.country}</td>
              <td className="px-5 py-3.5 text-right font-mono">
                {credit.vintage_year}
              </td>
              <td className="px-5 py-3.5 text-right font-mono">
                {formatNumber(volumeOf(credit))}
              </td>
              <td className="px-5 py-3.5 font-mono text-mute">
                {shortAddress(credit.owner)}
              </td>
              <td className="px-5 py-3.5">
                <StatusPill credit={credit} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-line py-24 text-center">
      <p className="font-serif text-xl text-paper">No records match</p>
      <p className="mt-2 max-w-sm text-sm text-mute">
        Adjust filters or search terms to broaden the registry scope.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 bg-emerald px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-deep"
      >
        Reset filters
      </button>
    </div>
  );
}
