import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks'

export default function Home() {
  usePageTitle("")
  return (
    <>
      <style>{`
        /* ── NAVBAR OVERRIDES ── */
        /* Forces your existing navbar to become transparent with white text */
        nav, header, [class*="nav"], [class*="header"] {
          background-color: transparent !important;
          border-bottom: none !important;
          position: absolute !important;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          box-shadow: none !important;
        }
        nav a, header a, nav span, header span, nav p, header p {
          color: #ffffff !important;
        }
        nav button, header button {
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }

        /* ── LAYOUT ── */
        .h-wrap {
          width: 100%;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── HERO (True Full Screen 100vh) ── */
        .h-hero {
          position: relative;
          width: 100%;
          height: 100vh; /* Exactly 100% of the viewport height */
          min-height: 600px;
          overflow: hidden;
          background: #000;
        }

        .h-hero__video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        /* Smooth gradient overlay to make the white text pop */
        .h-hero__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.85) 0%,
            rgba(0,0,0,0.4) 50%,
            rgba(0,0,0,0.1) 100%
          );
        }

        /* Vertically centered content */
        .h-hero__content {
          position: absolute;
          top: 50%;
          left: 5%;
          transform: translateY(-50%);
          z-index: 10;
          max-width: 900px;
        }

        /* Verra-style heavy typography matching your screenshot */
        .h-hero__title {
          font-size: clamp(42px, 5.5vw, 84px);
          font-weight: 900;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: 0.02em;
          margin: 0 0 3rem;
          text-shadow: 0 4px 24px rgba(0,0,0,0.5);
          text-transform: uppercase;
        }

        /* Verra-style solid white button */
        .h-hero__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: #000000;
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 20px 40px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .h-hero__btn:hover {
          background: #e5e5e5;
          transform: translateY(-2px);
        }

        /* Scroll Down Arrow Indicator */
        .h-scroll {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          cursor: pointer;
        }

        .h-scroll:hover {
          background: rgba(0,0,0,0.7);
        }

        /* ── SECTIONS BELOW HERO ── */
        .h-section {
          padding: 6rem 5%;
          background: #ffffff;
        }

        .h-section__eyebrow {
          font-size: 11px;
          font-weight: 700;
          color: #16a34a;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          margin-bottom: 1rem;
        }

        .h-section__title {
          font-size: clamp(28px, 3vw, 42px);
          font-weight: 300;
          color: #111;
          line-height: 1.2;
          max-width: 600px;
          margin: 0 0 4rem;
        }

        .h-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .h-card {
          border-top: 1px solid rgba(0,0,0,0.1);
          padding-top: 2rem;
        }

        .h-card__icon {
          width: 48px;
          height: 48px;
          background: rgba(34,197,94,0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .h-card__title {
          font-size: 18px;
          font-weight: 600;
          color: #111;
          margin-bottom: 1rem;
        }

        .h-card__body {
          font-size: 15px;
          color: #555;
          line-height: 1.7;
        }

        /* DRONE SPLIT SECTION */
        .h-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 500px;
        }

        .h-split__img {
          position: relative;
          overflow: hidden;
        }

        .h-split__img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .h-split__body {
          background: #0d1a0e;
          padding: 6rem 5%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .h-split__eyebrow {
          font-size: 11px;
          font-weight: 600;
          color: #4ade80;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          margin-bottom: 1rem;
        }

        .h-split__title {
          font-size: clamp(28px, 3vw, 42px);
          font-weight: 300;
          color: #f0faf0;
          line-height: 1.2;
          margin: 0 0 1.5rem;
        }

        .h-split__title strong {
          font-weight: 700;
        }

        .h-split__body p {
          font-size: 16px;
          color: rgba(255,255,255,0.6);
          line-height: 1.7;
          margin: 0 0 2.5rem;
          max-width: 480px;
        }

        .h-split__cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #0a0f0a;
          background: #22c55e;
          padding: 14px 28px;
          text-decoration: none;
          width: fit-content;
          transition: background 0.15s;
        }

        .h-split__cta:hover {
          background: #16a34a;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .h-hero__content { left: 5%; }
          .h-cards { grid-template-columns: 1fr; }
          .h-split { grid-template-columns: 1fr; }
          .h-split__img { height: 300px; }
          .h-section { padding: 4rem 5%; }
        }
      `}</style>

      <div className="h-wrap">

        {/* ── HERO ── */}
        <div className="h-hero">
          <video
            src="/combined-shot.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-hero__video"
            aria-label="Aerial drone view of forest landscape"
          />
          
          <div className="h-hero__overlay" />

          <div className="h-hero__content">
            <h2 className="h-hero__title">
              Endeavour sets the worlds<br />
              climate .<br />
            </h2>
            <h3 className="h-hero__title" style={{ fontSize: '12px', lineHeight: '1.4', marginBottom: '1rem' }}>
              <br />
              Immutable Chain
            </h3>
            
            <Link to="/registry" className="h-hero__btn">
              Explore Registry
            </Link>
          </div>

          <div className="h-scroll" aria-hidden="true" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* ── WHY ENDEAVOUR ── */}
        <div className="h-section">
          <p className="h-section__eyebrow">Why Endeavour</p>
          <h2 className="h-section__title">
            Institutional climate infrastructure for a transparent market
          </h2>
          <div className="h-cards">
            {[
              {
                icon: '🔒',
                title: 'Immutable Truth',
                body: 'Every carbon tonne is cryptographically verified on-chain. Provenance, vintage, and ownership are public — preventing double-spending and fraud.',
              },
              {
                icon: '⚡',
                title: 'On-Chain Automation',
                body: 'Smart contracts handle issuance, transfers, and retirements instantly — replacing weeks of manual PDF reviews with milliseconds of code execution.',
              },
              {
                icon: '🌐',
                title: 'Global Settlement',
                body: 'A borderless layer for climate finance. Corporate buyers and project developers transact directly without rent-seeking intermediaries.',
              },
            ].map((card) => (
              <div key={card.title} className="h-card">
                <div className="h-card__icon">
                  <span style={{ fontSize: '20px' }}>{card.icon}</span>
                </div>
                <div className="h-card__title">{card.title}</div>
                <div className="h-card__body">{card.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DRONE SPLIT SECTION ── */}
        <div className="h-split">
          <div className="h-split__img">
            <img
              src="https://images.unsplash.com/photo-1542401886-65d6c61db217?w=900&q=80"
              alt="Aerial view of forest canopy"
            />
          </div>
          <div className="h-split__body">
            <p className="h-split__eyebrow">Carbon Registry</p>
            <h2 className="h-split__title">
              <strong>Every credit.</strong><br />
              Every tonne.<br />
              On-chain forever.
            </h2>
            <p>
              Endeavour's registry bridges real-world verified carbon projects to the blockchain — giving buyers full transparency into project origin, methodology, and retirement status.
            </p>
            <Link to="/registry" className="h-split__cta">
              Explore Registry
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}