import { Link } from "react-router-dom"
import Logo from "./Logo"
import NetworkStatus from "./NetworkStatus"

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Registry", to: "/registry" },
      { label: "Analytics", to: "/analytics" },
      { label: "Issue credits", to: "/create" },
      { label: "Portfolio", to: "/manage" },
    ],
  },
  {
    title: "Token pools",
    links: [
      { label: "CarbonPool (eCO₂)", to: "/analytics" },
      { label: "BioPool (eBIO)", to: "/analytics" },
      { label: "Green Bond Vault", to: "/analytics" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Technology", to: "/about#technology" },
      { label: "Standards", to: "/about#how" },
      { label: "Contact", to: "/about#contact" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo inverted />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink/60">
              Token infrastructure for carbon credits, biodiversity pools, and
              sovereign green bonds — one auditable registry for climate finance.
            </p>
            <div className="mt-6">
              <NetworkStatus dark />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="label text-ink/50">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink/75 transition hover:text-emerald-bright"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ink/10 pt-8 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Endeavour Climate Infrastructure</p>
          <div className="flex gap-6">
            <span className="cursor-default hover:text-ink/80">Privacy</span>
            <span className="cursor-default hover:text-ink/80">Terms</span>
            <span className="cursor-default hover:text-ink/80">Security</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
