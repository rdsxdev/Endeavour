import { Link } from 'react-router-dom'

interface NavLink {
  label: string
  hasPlus?: boolean
  to: string
}

interface StatItem {
  value: string
  accent: string
  label: string
}

interface TickerItem {
  category: string
  text: string
  to: string
}

const NAV_LINKS: NavLink[] = [
  { label: 'Registry', hasPlus: true, to: '/registry' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Carbon Pool', hasPlus: true, to: '/pool' },
  { label: 'Manage', to: '/manage' },
  { label: 'About', to: '/about' },
]

const STATS: StatItem[] = [
  { value: '4.2', accent: 'M', label: 'Credits Minted (tCO₂)' },
  { value: '128', accent: 'K', label: 'Credits Retired' },
  { value: '$18', accent: '.4M', label: 'Total Liquidity' },
]

const TICKER_ITEMS: TickerItem[] = [
  {
    category: 'Registry',
    text: 'Sundarbans Mangrove Conservation Project listed on Arbourex',
    to: '/registry',
  },
  {
    category: 'Insights',
    text: 'How zkEVM enables real-time credit verification without gas bloat',
    to: '/insights',
  },
  {
    category: 'Market',
    text: 'Voluntary carbon credit floor prices up 12% in Q1 2025',
    to: '/market',
  },
  {
    category: 'Case Study',
    text: 'Reducing double-spend fraud in Southeast Asian forestry credits',
    to: '/case-studies',
  },
]

// 🔁 Swap with your own image:
// import heroBg from '../assets/hero-drone.jpg'
// then set: const HERO_IMAGE = heroBg
const HERO_IMAGE = '/hero.jpg'

function EndeavourLogo() {
  return (
    <svg
      width="32"
      height="36"
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Endeavour logo"
    >
      <path
        d="M16 2L30 10V26L16 34L2 26V10L16 2Z"
        stroke="#22c55e"
        strokeWidth="2"
        fill="rgba(34,197,94,0.08)"
      />
      <path
        d="M20 13C20 13 12 14 10 21C10 21 14 18 20 20C20 20 20 13 20 13Z"
        fill="#22c55e"
      />
      <path
        d="M10 21C10 21 10 27 16 27C16 27 13 24 20 20C20 20 10 21 10 21Z"
        fill="#16a34a"
      />
    </svg>
  )
}

interface LandingProps {
  onConnectWallet?: () => void
}

export default function Landing({ onConnectWallet }: LandingProps) {
  return (
    <div className="hero-wrap">

      {/* Background — drone image with dark overlay */}
      <div
        className="hero-bg"
        style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
      />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <EndeavourLogo />
          <div>
            <span className="logo-text">Endeavour</span>
            <span className="logo-sub">Protocol</span>
          </div>
        </div>

        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <Link to={link.to} key={link.label} className="nav-link">
              {link.label}
              {link.hasPlus && <span className="nav-plus">+</span>}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <div className="chain-sel">
            <div className="chain-dot" />
            Polygon zkEVM
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <button className="wallet-btn" onClick={onConnectWallet}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* HERO BODY */}
      <div className="hero-body">
        <div className="hero-accent" />
        <h1 className="hero-title">
          <strong>Tokenized Carbon Credits</strong>
          <br />
          on Immutable
          <br />
          Chain Infrastructure
        </h1>
        <p className="hero-sub">
          Built for transparent climate markets · Polygon zkEVM
        </p>

        <div className="hero-stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-item">
              <div className="stat-val">
                {stat.value}
                <span>{stat.accent}</span>
              </div>
              <div className="stat-lbl">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SCROLL HINT */}
      <div className="scroll-hint" aria-hidden="true">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>

      {/* TICKER */}
      <div className="ticker">
        {TICKER_ITEMS.map((item) => (
          <Link to={item.to} key={item.category} className="tick-cell">
            <div className="tick-cat">{item.category}</div>
            <div className="tick-text">{item.text}</div>
          </Link>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        .hero-wrap {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          width: 100%;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #0a0f0a;
          display: flex;
          flex-direction: column;
        }

        /* BG IMAGE + overlays */
        .hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
        }
        .hero-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(10, 15, 10, 0.55);
        }
        .hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(10, 15, 10, 0.3) 0%,
            rgba(10, 15, 10, 0.1) 50%,
            rgba(10, 15, 10, 0.75) 100%
          );
        }

        /* NAV */
        .nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2.5rem;
          border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-text {
          font-size: 15px;
          font-weight: 600;
          color: #f0faf0;
          letter-spacing: 0.04em;
          display: block;
        }
        .logo-sub {
          font-size: 9px;
          color: #4ade80;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          display: block;
          margin-top: 2px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-link {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .nav-link:hover {
          color: #4ade80;
        }
        .nav-plus {
          color: #22c55e;
          font-size: 13px;
          line-height: 1;
        }
        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .chain-sel {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.06);
          border: 0.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 7px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .chain-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a855f7;
          flex-shrink: 0;
        }
        .wallet-btn {
          font-size: 12px;
          color: #0a0f0a;
          background: #22c55e;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          transition: background 0.15s;
        }
        .wallet-btn:hover {
          background: #16a34a;
        }

        /* HERO BODY */
        .hero-body {
          position: relative;
          z-index: 10;
          padding: 4rem 2.5rem 2.5rem;
          flex: 1;
        }
        .hero-accent {
          width: 4px;
          height: 56px;
          background: #22c55e;
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }
        .hero-title {
          font-size: clamp(28px, 4vw, 46px);
          font-weight: 300;
          color: #f0faf0;
          line-height: 1.2;
          letter-spacing: -0.01em;
          max-width: 560px;
          margin: 0;
        }
        .hero-title strong {
          font-weight: 600;
          color: #fff;
        }
        .hero-sub {
          margin-top: 1rem;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
          font-weight: 400;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .hero-stats {
          display: flex;
          gap: 2.5rem;
          margin-top: 2.5rem;
        }
        .stat-item {
          border-left: 2px solid rgba(34, 197, 94, 0.35);
          padding-left: 1rem;
        }
        .stat-val {
          font-size: 22px;
          font-weight: 600;
          color: #f0faf0;
        }
        .stat-val span {
          color: #4ade80;
        }
        .stat-lbl {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.45);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 3px;
        }

        /* SCROLL HINT */
        .scroll-hint {
          position: absolute;
          bottom: 7rem;
          right: 2.5rem;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: 0.5;
        }
        .scroll-hint span {
          font-size: 10px;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          writing-mode: vertical-rl;
        }
        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 0));
        }

        /* TICKER */
        .ticker {
          position: relative;
          z-index: 10;
          background: rgba(0, 0, 0, 0.55);
          border-top: 0.5px solid rgba(255, 255, 255, 0.08);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          backdrop-filter: blur(8px);
        }
        .tick-cell {
          padding: 1rem 1.5rem;
          border-right: 0.5px solid rgba(255, 255, 255, 0.07);
          text-decoration: none;
          display: block;
          transition: background 0.15s;
        }
        .tick-cell:last-child {
          border-right: none;
        }
        .tick-cell:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .tick-cat {
          font-size: 10px;
          color: #22c55e;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 6px;
        }
        .tick-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.55;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .nav { padding: 1rem 1.25rem; }
          .nav-links { display: none; }
          .hero-body { padding: 3rem 1.25rem 2rem; }
          .ticker { grid-template-columns: repeat(2, 1fr); }
          .tick-cell:nth-child(2) { border-right: none; }
          .tick-cell:nth-child(3),
          .tick-cell:nth-child(4) { border-top: 0.5px solid rgba(255,255,255,0.07); }
          .scroll-hint { display: none; }
        }
      `}</style>
    </div>
  )
}