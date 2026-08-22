import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import WalletButton from "./WalletButton";

const LINKS = [
  { to: "/registry", label: "Registry" },
  { to: "/analytics", label: "Analytics" },
  { to: "/create", label: "Issue" },
  { to: "/manage", label: "Portfolio" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !onHome || menuOpen;
  console.log(window.location.pathname);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-line bg-ink/92 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" aria-label="Endeavour home">
          <Logo inverted={!solid} />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              style={{
                color:
                  window.location.pathname === "/"
                    ? solid
                      ? "black"
                      : "white"
                    : "black",
              }}
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[0.8125rem] font-medium tracking-wide transition-colors ${
                  isActive
                    ? solid
                      ? "text-emerald-deep"
                      : "text-white"
                    : solid
                      ? "text-mute hover:text-paper"
                      : "text-white/75 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:block">
          <WalletButton inverted={!solid} />
        </div>

        <button
          type="button"
          className={`${solid ? "text-paper" : "text-white"} lg:hidden`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-line bg-ink px-5 pb-6 pt-2 lg:hidden">
          <div className="flex flex-col">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `border-b border-line py-3.5 text-sm font-medium ${
                    isActive ? "text-emerald-deep" : "text-mute"
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
  );
}
