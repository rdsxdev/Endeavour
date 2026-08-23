import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCredits, useHealth, usePageTitle } from "../hooks";
import { computeStats, categoryOf, volumeOf } from "../stats";
import {
  formatNumber,
  formatCompact,
  creditStatus,
  shortAddress,
  type Credit,
} from "../api";
import { POOLS, poolColor } from "../pools";
import PageHeader from "../components/PageHeader";
import { Panel, Metric } from "../components/ui";
import Reveal from "../components/Reveal";
import AreaChart from "../components/AreaChart";
import Sparkline from "../components/Sparkline";

export default function Analytics() {
  usePageTitle("Analytics");
  const { credits: rawCredits, loading } = useCredits();
  const { health, live } = useHealth();
  const credits: Credit[] = useMemo(() => rawCredits ?? [], [rawCredits]);
  const stats = useMemo(() => computeStats(credits), [credits]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of credits) {
      const cat = categoryOf(c.project);
      map.set(cat, (map.get(cat) ?? 0) + volumeOf(c));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [credits]);

  const byCountry = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of credits) {
      map.set(c.country, (map.get(c.country) ?? 0) + volumeOf(c));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [credits]);

  const byVintage = useMemo(() => {
    const map = new Map<number, number>();
    for (const c of credits) {
      map.set(c.vintage_year, (map.get(c.vintage_year) ?? 0) + volumeOf(c));
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [credits]);

  const recent = useMemo(
    () => [...credits].sort((a, b) => b.created_at - a.created_at).slice(0, 6),
    [credits],
  );

  const categoryColors = [
    "var(--color-pool-carbon)",
    "var(--color-pool-bio)",
    "var(--color-sky)",
    "var(--color-amber)",
    "var(--color-emerald-bright)",
  ];

  return (
    <>
      <PageHeader
        eyebrow="Market intelligence"
        title="Analytics"
        intro="Live registry metrics across CarbonPool, BioPool, and Green Bond Vault — issuance, verification, retirements, and geographic exposure."
        image={
          "https://images.unsplash.com/photo-1603179353823-96a5deaca2c5?q=80&w=2764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        imageAlt="Earth from orbit"
      >
        <div className="surface flex items-center gap-2 px-4 py-2.5">
          <span
            className={`pulse-dot h-1.5 w-1.5 rounded-full ${live ? "bg-emerald" : "bg-amber"}`}
          />
          <span className="text-sm text-mute">
            {live ? "Live chain data" : "Registry snapshot"}
          </span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Reveal>
            <Metric
              label="Credits issued"
              value={loading ? "—" : formatNumber(stats.totalCredits)}
              sub={`${formatCompact(stats.tonnesOffset)} tCO₂e`}
            />
          </Reveal>
          <Reveal delay={60}>
            <Metric
              label="Verified"
              value={loading ? "—" : `${stats.verifiedPct}%`}
              sub={`${formatNumber(stats.verifiedCredits)} credits`}
            />
          </Reveal>
          <Reveal delay={120}>
            <Metric
              label="Retired"
              value={loading ? "—" : formatNumber(stats.retiredCredits)}
              sub={`${formatCompact(stats.tonnesRetired)} tCO₂e offset`}
            />
          </Reveal>
          <Reveal delay={180}>
            <Metric
              label="Active projects"
              value={loading ? "—" : formatNumber(stats.activeProjects)}
              sub={`${stats.countries} countries`}
            />
          </Reveal>
        </div>

        {/* Pool overview */}
        <Reveal className="mt-8">
          <Panel className="p-6">
            <h3 className="font-serif text-lg text-paper">
              Token pool overview
            </h3>
            <p className="mt-1 text-sm text-mute">
              Supply utilisation across asset classes
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {POOLS.map((pool) => {
                const util = Math.round(
                  ((pool.totalSupply - pool.available) / pool.totalSupply) *
                    100,
                );
                const color = poolColor(pool.kind);
                return (
                  <div
                    key={pool.id}
                    className="border-t-2 pt-4"
                    style={{ borderColor: color }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-xs text-mute">
                          {pool.symbol}
                        </p>
                        <p className="mt-0.5 font-medium text-paper">
                          {pool.name}
                        </p>
                      </div>
                      <Sparkline data={pool.trend} color={color} />
                    </div>
                    <p className="mt-3 font-mono text-xl text-paper">
                      {formatCompact(pool.totalSupply)}
                      <span className="ml-1 text-xs text-mute">
                        {pool.unit}
                      </span>
                    </p>
                    <div className="mt-3 h-1 bg-ink-3">
                      <div
                        className="h-full"
                        style={{ width: `${util}%`, background: color }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-mute">{util}% allocated</p>
                  </div>
                );
              })}
            </div>
          </Panel>
        </Reveal>

        {/* Charts */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Panel className="p-6">
              <h3 className="font-serif text-lg text-paper">
                Issuance by vintage
              </h3>
              <p className="mt-1 text-sm text-mute">
                Credit volume per vintage year (tCO₂e)
              </p>
              <VintageChart data={byVintage} loading={loading} />
            </Panel>
          </Reveal>

          <Reveal delay={80}>
            <Panel className="p-6">
              <h3 className="font-serif text-lg text-paper">Methodology mix</h3>
              <p className="mt-1 text-sm text-mute">Volume by project type</p>
              <div className="mt-6 flex flex-col gap-5">
                {byCategory.map(([cat, vol], i) => {
                  const total = byCategory.reduce((s, [, v]) => s + v, 0) || 1;
                  const pct = Math.round((vol / total) * 100);
                  const color = categoryColors[i % categoryColors.length]!;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm">
                        <span className="text-paper">{cat}</span>
                        <span className="font-mono text-mute">{pct}%</span>
                      </div>
                      <div className="mt-2 flex h-3 overflow-hidden bg-ink-3">
                        <div
                          className="h-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Panel className="p-6">
              <h3 className="font-serif text-lg text-paper">
                Geographic exposure
              </h3>
              <p className="mt-1 text-sm text-mute">
                Top issuing jurisdictions
              </p>
              <div className="mt-6 flex flex-col gap-4">
                {byCountry.map(([country, vol], i) => {
                  const max = byCountry[0]?.[1] || 1;
                  const pct = Math.round((vol / max) * 100);
                  return (
                    <div key={country} className="flex items-center gap-4">
                      <span className="w-8 font-mono text-xs text-mute">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="w-32 shrink-0 truncate text-sm text-paper">
                        {country}
                      </span>
                      <div className="h-2 flex-1 bg-ink-3">
                        <div
                          className="h-full bg-emerald transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right font-mono text-xs text-mute">
                        {formatCompact(vol)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={80}>
            <Panel className="p-6">
              <h3 className="font-serif text-lg text-paper">
                CarbonPool trend
              </h3>
              <p className="mt-1 text-sm text-mute">
                6-month issuance velocity
              </p>
              <div className="mt-4">
                <AreaChart
                  data={POOLS[0]!.trend.map((v, i) => ({
                    label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i] ?? "",
                    value: v,
                  }))}
                  color="var(--color-pool-carbon)"
                  height={160}
                />
              </div>
              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-mute">Network</dt>
                  <dd className="font-mono text-paper">Endeavour L2</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mute">Latest block</dt>
                  <dd className="font-mono text-paper">
                    #{formatNumber(health?.latest_block ?? 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mute">Net impact</dt>
                  <dd className="font-mono text-emerald-deep">
                    {formatCompact(stats.tonnesRetired)} tCO₂e
                  </dd>
                </div>
              </dl>
            </Panel>
          </Reveal>
        </div>

        {/* Activity table */}
        <Reveal className="mt-6">
          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-paper">Recent activity</h3>
              <Link
                to="/registry"
                className="text-sm font-medium text-emerald-deep hover:text-emerald"
              >
                View registry →
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
        </Reveal>
      </div>
    </>
  );
}

function VintageChart({
  data,
  loading,
}: {
  data: [number, number][];
  loading: boolean;
}) {
  const max = Math.max(...data.map(([, v]) => v), 1);
  if (loading) return <div className="mt-8 h-52 animate-pulse bg-ink-3" />;

  return (
    <div className="mt-8 flex h-52 items-end gap-3">
      {data.map(([year, vol]) => {
        const h = Math.max((vol / max) * 100, 6);
        return (
          <div
            key={year}
            className="group flex flex-1 flex-col items-center gap-2"
          >
            <span className="font-mono text-[0.65rem] text-mute opacity-0 transition-opacity group-hover:opacity-100">
              {formatCompact(vol)}
            </span>
            <div
              className="w-full bg-emerald/80 transition-all duration-700 group-hover:bg-emerald"
              style={{ height: `${h}%` }}
            />
            <span className="font-mono text-xs text-mute">{year}</span>
          </div>
        );
      })}
    </div>
  );
}

function ActivityRow({ credit }: { credit: Credit }) {
  const status = creditStatus(credit);
  const colors: Record<string, string> = {
    Retired: "text-sky",
    Verified: "text-emerald-deep",
    Pending: "text-amber",
  };

  return (
    <tr className="border-b border-line/60 last:border-0">
      <td className="py-3.5 pr-4">
        <Link
          to={`/credit/${credit.id}`}
          className="font-mono text-mute hover:text-emerald-deep"
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
      <td
        className={`py-3.5 text-xs font-medium uppercase tracking-wide ${colors[status] ?? ""}`}
      >
        {status}
      </td>
    </tr>
  );
}
