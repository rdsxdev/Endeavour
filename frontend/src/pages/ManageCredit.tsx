import { useState } from "react"
import { Link } from "react-router-dom"
import { Flame, Send, History, ArrowUpRight, ShieldCheck, Wallet } from "lucide-react"

// Mock portfolio data for the dashboard
const PORTFOLIO = [
  { id: "4920", project: "Rimba Raya Biodiversity", volume: 25000, status: "Active", vintage: 2023 },
  { id: "4921", project: "Keo Seima Wildlife", volume: 10000, status: "Active", vintage: 2022 },
  { id: "4810", project: "Solar Farm Rajasthan", volume: 5000, status: "Retired", vintage: 2021 },
]

export default function ManageCredit() {
  const [activeTab, setActiveTab] = useState<"holdings" | "history">("holdings")

  return (
    <div className="pb-24 pt-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-paper sm:text-4xl">Portfolio Manager</h1>
            <p className="mt-2 text-mute">Manage your institutional carbon holdings, execute transfers, and verify retirements.</p>
          </div>
          <div className="flex items-center gap-3 bg-ink-2 border border-line rounded-xl p-3">
            <div className="h-10 w-10 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald-bright">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-mute uppercase tracking-wider">Connected Wallet</p>
              <p className="font-mono text-sm text-paper">0x8F9a...2B4c</p>
            </div>
          </div>
        </div>

        {/* High-Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-ink-2 border border-line rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl" />
            <p className="text-sm font-medium text-mute mb-2">Total Active Volume</p>
            <p className="text-4xl font-mono font-bold text-paper">35,000 <span className="text-lg text-mute font-sans">tCO₂e</span></p>
          </div>
          <div className="bg-ink-2 border border-line rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-amber-500/10 rounded-full blur-2xl" />
            <p className="text-sm font-medium text-mute mb-2">Total Retired Volume</p>
            <p className="text-4xl font-mono font-bold text-paper">5,000 <span className="text-lg text-mute font-sans">tCO₂e</span></p>
          </div>
          <div className="bg-ink-2 border border-line rounded-2xl p-6 flex flex-col justify-center">
            <Link to="/create" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald/10 border border-emerald/20 px-4 py-3 font-semibold text-emerald-bright hover:bg-emerald/20 transition-colors">
              Issue New Credits <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-line mb-6">
          <button 
            onClick={() => setActiveTab("holdings")}
            className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "holdings" ? "border-emerald-bright text-emerald-bright" : "border-transparent text-mute hover:text-paper"}`}
          >
            Current Holdings
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`pb-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "history" ? "border-emerald-bright text-emerald-bright" : "border-transparent text-mute hover:text-paper"}`}
          >
            Transaction History
          </button>
        </div>

        {/* Asset Table */}
        <div className="bg-ink-2 border border-line rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-ink border-b border-line text-mute">
              <tr>
                <th className="px-6 py-4 font-medium">Asset ID</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Vintage</th>
                <th className="px-6 py-4 font-medium">Volume (tCO₂e)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PORTFOLIO.filter(p => activeTab === "holdings" ? p.status === "Active" : p.status === "Retired").map((asset) => (
                <tr key={asset.id} className="hover:bg-ink/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-mute">#{asset.id}</td>
                  <td className="px-6 py-4 text-paper font-medium">{asset.project}</td>
                  <td className="px-6 py-4 font-mono text-paper">{asset.vintage}</td>
                  <td className="px-6 py-4 font-mono text-paper">{asset.volume.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${asset.status === "Active" ? "bg-emerald/10 text-emerald-bright border border-emerald/20" : "bg-slate-800 text-mute border border-line"}`}>
                      {asset.status === "Active" ? <ShieldCheck className="h-3 w-3" /> : <History className="h-3 w-3" />}
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {asset.status === "Active" ? (
                      <div className="flex justify-end gap-2">
                        <button className="inline-flex items-center gap-1 rounded-md bg-ink border border-line px-3 py-1.5 text-xs font-medium text-paper hover:bg-ink-3 transition-colors">
                          <Send className="h-3 w-3" /> Transfer
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                          <Flame className="h-3 w-3" /> Retire
                        </button>
                      </div>
                    ) : (
                      <Link to={`/credit/${asset.id}`} className="text-emerald-bright hover:text-emerald text-xs font-medium">View Certificate</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activeTab === "history" && (
            <div className="p-6 text-center border-t border-line">
               <p className="text-sm text-mute">Retirements are permanent and cryptographically verified.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}