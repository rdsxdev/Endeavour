import { Link, NavLink, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import Logo from "./Logo"
import WalletButton from "./WalletButton"

const LINKS = [
  { to: "/registry", label: "Registry" },
  { to: "/analytics", label: "Analytics" },
  { to: "/create", label: "Create Credit" },
  { to: "/manage", label: "Manage" },
  { to: "/about", label: "About" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // The home page has a full-bleed hero, so the bar starts transparent there.
  const onHome = location.pathname === "/"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const solid = scrolled || !onHome || menuOpen

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "border-b border-line bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" aria-label="Endeavour home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-paper"
                    : "text-mute hover:text-paper"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:block">
          <WalletButton />
        </div>

        <button
          className="text-paper lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-line bg-ink px-5 pb-6 pt-2 lg:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-ink-3 text-paper"
                      : "text-mute hover:bg-ink-2 hover:text-paper"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4">
            <WalletButton />
          </div>
        </div>
      )}
    </header>
  )
}
