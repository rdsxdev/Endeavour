import { Link } from "react-router-dom";
import { usePageTitle, useCountUp } from "../hooks";
import Reveal from "../components/Reveal";
import PoolCard from "../components/PoolCard";
import { POOLS } from "../pools";
import { formatCompact } from "../api";

const PILLARS = [
  {
    num: "01",
    title: "Verified provenance",
    body: "Every tonne is cryptographically anchored. Vintage, methodology, and ownership are auditable — eliminating double-counting across voluntary markets.",
  },
  {
    num: "02",
    title: "Tokenised settlement",
    body: "Carbon credits, biodiversity units, and sovereign green bonds settle on a single registry. Corporates and governments transact without opaque intermediaries.",
  },
  {
    num: "03",
    title: "Institutional rails",
    body: "Built for treasury desks and project developers alike — issuance, transfer, and retirement execute in seconds, not weeks of manual review.",
  },
];

export default function Home() {
  usePageTitle("");
  const totalSupply = POOLS.reduce((s, p) => s + p.totalSupply, 0);
  const { value: supplyCount } = useCountUp(totalSupply, 1800);

  return (
    <div className="bg-ink">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
        <video
          src="/combined-shot.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="animate-slow-zoom absolute inset-0 h-full w-full object-cover"
          aria-label="Aerial view of forest landscape"
          preload="true"
        />
        <div className="bg-linear-to-t from-black to-transparent absolute inset-0" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-28 pt-32 lg:px-8">
          <Reveal>
            <p className="eyebrow text-emerald-bright/90">
              Climate token infrastructure
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-serif mt-5 max-w-4xl text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.08] text-white">
              Carbon credits, biodiversity pools &amp; green bonds — one
              registry.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-lg text-white/75">
              Endeavour tokenises environmental assets for companies,
              governments, and project developers who need transparent, on-chain
              settlement.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/registry"
                className="inline-flex items-center bg-white px-7 py-3.5 text-sm font-semibold text-paper transition hover:bg-ink-2"
              >
                Explore registry
              </Link>
              <Link
                style={{
                  color: "white",
                }}
                to="/analytics"
                className="inline-flex items-center border border-white/30 px-7 py-3.5 text-sm font-medium text-white transition hover:border-white/60"
              >
                View analytics
              </Link>
            </div>
          </Reveal>
        </div>

        <button
          type="button"
          aria-label="Scroll to content"
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
          }
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 border border-white/20 p-2 text-white/60 transition hover:border-white/40 hover:text-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </section>

      {/* Live stats strip */}
      <div className="stat-strip">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-line md:grid-cols-4">
          {[
            {
              label: "Tokenised supply",
              value: formatCompact(supplyCount),
              unit: "units",
            },
            { label: "Asset pools", value: "3", unit: "live" },
            { label: "Jurisdictions", value: "12+", unit: "" },
            { label: "Settlement", value: "<2s", unit: "avg" },
          ].map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 60}
              className="px-6 py-6 text-center md:py-8"
            >
              <p className="label">{stat.label}</p>
              <p className="mt-1 font-mono text-2xl text-paper">
                {stat.value}
                {stat.unit && (
                  <span className="ml-1 text-sm text-mute">{stat.unit}</span>
                )}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Token pools */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <SectionIntro
            eyebrow="Token pools"
            title="Three asset classes, one settlement layer"
            intro="CarbonPool aggregates verified credits. BioPool tracks biodiversity outcomes. Green Bond Vault holds tokenised sovereign instruments."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {POOLS.map((pool, i) => (
            <Reveal key={pool.id} delay={i * 100}>
              <PoolCard pool={pool} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-line bg-ink-2 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionIntro
              eyebrow="Why Endeavour"
              title="Infrastructure for a transparent climate market"
            />
          </Reveal>
          <div className="mt-14 grid gap-px bg-line md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.num} delay={i * 80}>
                <article className="bg-ink-2 p-8 md:p-10 h-full">
                  <span className="font-mono text-sm text-emerald-deep">
                    {p.num}
                  </span>
                  <h3 className="font-serif mt-4 text-xl text-paper">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mute">
                    {p.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Split CTA */}
      <section className="grid min-h-[420px] lg:grid-cols-2">
        <div className="relative overflow-hidden">
          <img
            src="/new.jpg"
            alt="Forest canopy from above"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
        <Reveal className="flex flex-col justify-center bg-paper px-8 py-16 lg:px-14">
          <p className="eyebrow text-emerald-bright">For institutions</p>
          <h2 className="font-serif mt-4 text-3xl text-ink lg:text-4xl">
            Issue, hold, or retire — on your terms.
          </h2>
          <p className="mt-4 max-w-md text-ink/70">
            Whether you&apos;re a corporate buyer sourcing verified offsets or a
            sovereign issuer tokenising green bonds, Endeavour provides the
            rails.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/create"
              className="bg-emerald px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep"
            >
              Issue credits
            </Link>
            <Link
              style={{
                color: "white",
              }}
              to="/manage"
              className="border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-ink/40"
            >
              Manage portfolio
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-emerald-deep">{eyebrow}</p>
      <h2 className="font-serif mt-3 text-3xl text-paper sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-mute">{intro}</p>}
    </div>
  );
}
