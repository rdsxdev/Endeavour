import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks";
import { POOLS } from "../pools";
import Reveal from "../components/Reveal";
import PoolCard from "../components/PoolCard";

const HIGH_RES_ABOUT =
  "https://images.unsplash.com/flagged/photo-1574848487348-533aaf72833e?q=80&w=2170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const PILLARS = [
  {
    title: "Immutable provenance",
    body: "Every environmental unit registered on Endeavour is cryptographically verified. Vintage, methodology, and ownership are public — preventing double-spending across voluntary and compliance markets.",
  },
  {
    title: "Multi-asset settlement",
    body: "Carbon credits, biodiversity tokens, and sovereign green bonds settle on unified rails. Corporates, governments, and project developers transact without opaque intermediaries.",
  },
  {
    title: "Institutional standards",
    body: "Aligned with Verra, Gold Standard, and ICVCM integrity principles. Built for treasury desks that need audit-ready reporting and sub-second settlement.",
  },
];

const STANDARDS = [
  { name: "Verra", detail: "Compatible methodologies" },
  { name: "Gold Standard", detail: "Verification mapping" },
  { name: "ICVCM Core", detail: "Integrity principles" },
  { name: "ISO 14064-2", detail: "Quantification compliant" },
];

export default function About() {
  usePageTitle("About");

  return (
    <div className="bg-ink pb-24">
      <section className="relative h-[420px] overflow-hidden">
        <img
          src={HIGH_RES_ABOUT}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/80 to-paper/40" />
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
            <Reveal>
              <p className="eyebrow text-emerald-bright">
                The Endeavour protocol
              </p>
              <h1 className="font-serif mt-4 max-w-3xl text-4xl text-ink md:text-5xl">
                Climate finance infrastructure for a tokenised world.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-ink/70">
                We built Endeavour to solve opacity, double-counting, and slow
                settlement in carbon markets — extending the same rails to
                biodiversity and sovereign green bonds.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <Reveal>
          <div className="grid gap-px bg-line md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <article key={p.title} className="bg-ink p-8 md:p-10">
                <span className="font-mono text-sm text-emerald-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif mt-4 text-xl text-paper">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </Reveal>

        <section id="technology" className="mt-20">
          <Reveal>
            <p className="label">Token ecosystem</p>
            <h2 className="font-serif mt-2 text-3xl text-paper">
              Three pools, one registry
            </h2>
            <p className="mt-3 max-w-2xl text-mute">
              CarbonPool, BioPool, and Green Bond Vault share settlement
              infrastructure while maintaining distinct asset-class governance.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {POOLS.map((pool, i) => (
              <Reveal key={pool.id} delay={i * 80}>
                <PoolCard pool={pool} />
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how" className="mt-20 border-t border-line pt-16">
          <Reveal>
            <h2 className="font-serif text-center text-3xl text-paper">
              Built for institutional standards
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-mute">
              Operating at the intersection of climate science and cryptographic
              security.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-px bg-line md:grid-cols-4">
            {STANDARDS.map((s, i) => (
              <Reveal key={s.name} delay={i * 60}>
                <div className="bg-ink p-8 text-center">
                  <p className="font-serif text-lg text-paper">{s.name}</p>
                  <p className="mt-2 text-xs text-mute">{s.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal className="mt-20">
          <div
            className="border border-line bg-ink-2 p-10 text-center sm:p-14"
            id="contact"
          >
            <h2 className="font-serif text-3xl text-paper">
              Ready to tokenise environmental impact?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-mute">
              Whether you&apos;re an institutional buyer sourcing verified
              credits or a sovereign issuer listing green bonds, Endeavour
              provides the settlement layer.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                style={{
                  color: "white",
                }}
                to="/registry"
                className="bg-emerald px-8 py-3.5 text-sm font-semibold text-white hover:bg-emerald-deep"
              >
                Explore registry
              </Link>
              <Link
                to="/create"
                className="border border-line px-8 py-3.5 text-sm font-medium text-paper hover:bg-ink"
              >
                Issue credits
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
