import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks";
import { POOLS, poolColor } from "../pools";
import { formatCompact, getCredits, retireCredit, transferCredit, type Credit } from "../api";
import PageHeader from "../components/PageHeader";
import Reveal from "../components/Reveal";
import AreaChart from "../components/AreaChart";
import Sparkline from "../components/Sparkline";



export default function ManageCredit() {
  usePageTitle("Portfolio");
  const [portfolio, setPortfolio] = useState<Credit[]>([]);
  const [busy, setBusy] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"holdings" | "history">(
    "holdings",
  );

  useEffect(() => {
    getCredits()
      .then((credits) => setPortfolio(credits))
      .catch((err) => console.error("Failed to load portfolio:", err))
;
  }, [portfolio]);

  const activeVolume = portfolio.filter((p) => !p.retired).reduce(
    (s) => s + 1,
    0,
  );
  const retiredVolume = portfolio.filter((p) => p.retired).reduce(
    (s) => s + 1,
    0,
  );

  const poolBreakdown = useMemo(() => {
    const active = portfolio.filter((p) => !p.retired).length
    return [["carbon", active] as const]
  }, [portfolio]);

  const filtered = portfolio.filter((p) =>
    activeTab === "holdings" ? !p.retired : p.retired,
  );

  return (
    <>
      <PageHeader
        eyebrow="Institutional portfolio"
        title="Manage"
        intro="Holdings across CarbonPool, BioPool, and Green Bond Vault — transfer, retire, or issue new credits."
        image={
          "https://images.unsplash.com/photo-1559767180-47d8f4919e5d?q=80&w=2715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        imageAlt="Renewable energy landscape"
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
              <p className="mt-1 text-sm text-mute">
                Active holdings by token pool
              </p>
              <div className="mt-6 space-y-4">
                {poolBreakdown.map(([kind, vol]) => {
                  const pool = POOLS.find((p) => p.kind === kind);
                  const color = poolColor(kind as "carbon" | "bio" | "bond");
                  const pct = Math.round((vol / activeVolume) * 100);
                  return (
                    <div key={kind}>
                      <div className="flex justify-between text-sm">
                        <span className="font-mono text-mute">
                          {pool?.symbol}
                        </span>
                        <span className="text-paper">
                          {formatCompact(vol)} ({pct}%)
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-ink-3">
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
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
                {tab === "holdings"
                  ? "Current holdings"
                  : "Transaction history"}
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
                  const pool = POOLS.find((p) => p.kind === "carbon") ?? POOLS[0];
                  return (
                    <tr key={asset.id} className="hover:bg-ink-2">
                      <td className="px-5 py-3.5 font-mono text-mute">
                        #{asset.id}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-paper">
                        {asset.project}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2 font-mono text-xs">
                          <Sparkline
                            data={pool?.trend ?? []}
                            color={poolColor("carbon")}
                            width={48}
                            height={20}
                          />
                          {pool?.symbol}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">{asset.vintage_year}</td>
                      <td className="px-5 py-3.5 font-mono">
                        1
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-medium uppercase tracking-wide ${
                            !asset.retired
                              ? "text-emerald-deep"
                              : "text-mute"
                          }`}
                        >
                          {asset.retired ? "Retired" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {!asset.retired ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={busy === asset.id}
                              onClick={async () => {
                                const newOwner = window.prompt(
                                  "Enter the new Ethereum wallet address:"
                                );
                                if (!newOwner) return;

                                try {
                                  setBusy(asset.id);
                                  await transferCredit(Number(asset.id), newOwner);
                                  alert("Credit transferred successfully.");
                                } catch (err) {
                                  alert(
                                    err instanceof Error
                                      ? err.message
                                      : "Transfer failed."
                                  );
                                } finally {
                                  setBusy(null);
                                }
                              }}
                              className="border border-line px-3 py-1 text-xs hover:bg-ink-2 disabled:opacity-50"
                            >
                              {busy === asset.id ? "..." : "Transfer"}
                            </button>
                            <button
                              type="button"
                              disabled={busy === asset.id}
                              onClick={async () => {
                                if (!window.confirm(
                                  `Retire credit #${asset.id}? This action is permanent.`
                                )) return;

                                try {
                                  setBusy(asset.id);
                                  await retireCredit(Number(asset.id));

                                  setPortfolio((current) =>
                                    current.map((item) =>
                                      item.id === asset.id
                                        ? { ...item, status: "Retired" }
                                        : item
                                    )
                                  );

                                  alert("Credit retired successfully.");
                                } catch (err) {
                                  alert(
                                    err instanceof Error
                                      ? err.message
                                      : "Retirement failed."
                                  );
                                } finally {
                                  setBusy(null);
                                }
                              }}
                              className="border border-line px-3 py-1 text-xs text-amber hover:bg-ink-2 disabled:opacity-50"
                            >
                              {busy === asset.id ? "..." : "Retire"}
                            </button>
                          </div>
                        ) : (
                          <Link
                            to={`/credit/${asset.id}`}
                            className="text-xs text-emerald-deep hover:text-emerald"
                          >
                            Certificate →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </>
  );
}
