import { Link } from "react-router-dom"
import { ArrowRight, Globe2, ShieldCheck, Cpu, CheckCircle2 } from "lucide-react"
import { usePageTitle } from "../hooks"

// Swapped to a much darker, moody, institutional-grade forest image
const HIGH_RES_ABOUT = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2600&auto=format&fit=crop"

export default function About() {
  usePageTitle("About")
  return (
    <div className="pb-24 bg-ink">
      {/* Premium Dark Image Header */}
      <div className="relative h-[450px] w-full overflow-hidden">
        <img
          src={HIGH_RES_ABOUT}
          alt="Dark forest canopy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Much stronger, darker gradient to ensure text pops and matches the deep navy theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/95 via-ink/80 to-ink" />
        <div className="absolute inset-0 bg-emerald-900/10 mix-blend-overlay" />
        
        <div className="absolute bottom-16 left-0 w-full z-10">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1.5 text-xs font-mono font-medium text-emerald-bright mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              The Endeavour Protocol
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white max-w-3xl leading-[1.1]">
              Institutional climate <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">infrastructure.</span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl leading-relaxed">
              We built Endeavour to solve the voluntary carbon market's biggest problems: opacity, double-counting, and slow settlement speeds.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 relative z-10">
        
        {/* Core Pillars */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="group bg-ink-2 border border-line rounded-2xl p-8 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-bright mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-paper mb-3">Immutable Truth</h3>
            <p className="text-mute leading-relaxed">
              Every carbon tonne registered on Endeavour is cryptographically verified. Provenance, vintage, and ownership are public, preventing double-spending and fraud.
            </p>
          </div>

          <div className="group bg-ink-2 border border-line rounded-2xl p-8 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-bright mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-paper mb-3">On-Chain Automation</h3>
            <p className="text-mute leading-relaxed">
              Smart contracts handle issuance, transfers, and retirements instantly. We replace weeks of manual PDF reviews with milliseconds of code execution.
            </p>
          </div>

          <div className="group bg-ink-2 border border-line rounded-2xl p-8 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-bright mb-6 group-hover:scale-110 transition-transform">
              <Globe2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-paper mb-3">Global Settlement</h3>
            <p className="text-mute leading-relaxed">
              A borderless layer for climate finance. Corporate buyers and project developers can transact directly without rent-seeking intermediaries.
            </p>
          </div>
        </div>

        {/* Institutional Standards Section */}
        <div className="mt-24 border-t border-line pt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-paper">Built for Institutional Standards</h2>
            <p className="text-mute mt-3 max-w-2xl mx-auto">Operating at the intersection of climate science and cryptographic security.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-8 bg-ink border border-line rounded-2xl flex flex-col items-center hover:bg-ink-2 transition-colors">
              <CheckCircle2 className="h-8 w-8 text-emerald-bright mb-4" />
              <p className="font-semibold text-paper">Verra Aligned</p>
              <p className="text-xs text-mute mt-2">Compatible methodologies</p>
            </div>
            <div className="p-8 bg-ink border border-line rounded-2xl flex flex-col items-center hover:bg-ink-2 transition-colors">
               <CheckCircle2 className="h-8 w-8 text-emerald-bright mb-4" />
              <p className="font-semibold text-paper">Gold Standard</p>
              <p className="text-xs text-mute mt-2">Verification mapping</p>
            </div>
            <div className="p-8 bg-ink border border-line rounded-2xl flex flex-col items-center hover:bg-ink-2 transition-colors">
               <CheckCircle2 className="h-8 w-8 text-emerald-bright mb-4" />
              <p className="font-semibold text-paper">ICVCM Core</p>
              <p className="text-xs text-mute mt-2">Integrity principles</p>
            </div>
            <div className="p-8 bg-ink border border-line rounded-2xl flex flex-col items-center hover:bg-ink-2 transition-colors">
               <CheckCircle2 className="h-8 w-8 text-emerald-bright mb-4" />
              <p className="font-semibold text-paper">ISO 14064-2</p>
              <p className="text-xs text-mute mt-2">Quantification compliant</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 border border-line bg-gradient-to-br from-ink-2 to-ink rounded-3xl p-10 sm:p-16 text-center max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
          <h2 className="text-3xl font-bold text-paper mb-4 relative z-10">Ready to shape the future of climate finance?</h2>
          <p className="text-lg text-mute mb-8 max-w-2xl mx-auto relative z-10">
            Whether you're an institutional buyer looking for premium verified credits, or a developer tokenizing environmental impact, Endeavour is your platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link to="/registry" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-8 py-4 font-semibold text-ink hover:bg-emerald-400 transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Explore the Registry <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}