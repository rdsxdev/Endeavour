import { Link } from "react-router-dom"
import Logo from "./Logo.tsx"
import NetworkStatus from "./NetworkStatus"

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Registry Explorer", to: "/registry" },
      { label: "Analytics Dashboard", to: "/analytics" },
      { label: "Create Credit", to: "/create" },
      { label: "Manage Credit", to: "/manage" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Endeavour", to: "/about" },
      { label: "How It Works", to: "/about#how" },
      { label: "Technology", to: "/about#technology" },
      { label: "Contact", to: "/about#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Methodologies", to: "/about#technology" },
      { label: "Verification", to: "/about#technology" },
      { label: "Documentation", to: "/about" },
      { label: "Audit Reports", to: "/about" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-mute">
              Blockchain-native infrastructure for issuing, verifying,
              transferring and retiring carbon credits — one auditable source of
              truth for global carbon markets.
            </p>
            <div className="mt-6">
              <NetworkStatus />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[0.7rem] font-semibold uppercase tracking-widest text-mute">
                {col.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-paper/80 transition-colors hover:text-emerald-bright"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-xs text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Endeavour Climate Infrastructure. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="cursor-default hover:text-paper">Privacy</span>
            <span className="cursor-default hover:text-paper">Terms</span>
            <span className="cursor-default hover:text-paper">Security</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
