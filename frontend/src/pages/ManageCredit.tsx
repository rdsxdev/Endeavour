import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, ShieldCheck, Flame, Copy, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Loader as Loader2 } from "lucide-react"
import { useCredits } from "../hooks"
import {
  formatNumber,
  shortAddress,
  retireCredit,
  transferCredit,
  type Credit,
} from "../api"
import { categoryOf, volumeOf } from "../stats"
import { StatusPill } from "../components/ui"
import PageHeader from "../components/PageHeader"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="rounded p-1 text-mute hover:text-emerald-bright"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-bright" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

export default function ManageCredit() {
  const { credits, loading } = useCredits()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [newOwner, setNewOwner] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const activeCredits = (credits as Credit[]).filter((c) => !c.retired)
  const selectedCredit = selectedId !== null
    ? (credits as Credit[]).find((c) => c.id === selectedId)
    : null

  async function handleRetire() {
    if (!selectedCredit) return
    setActionLoading(true)
    setMessage(null)
    try {
      const result = await retireCredit(selectedCredit.id)
      setMessage({ type: "success", text: `Credit retired. Tx: ${result.tx_hash.slice(0, 10)}...` })
      setSelectedId(null)
    } catch {
      setMessage({ type: "error", text: "Failed to retire credit. Please try again." })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleTransfer() {
    if (!selectedCredit || !newOwner.trim()) return
    if (!/^0x[a-fA-F0-9]{40}$/.test(newOwner.trim())) {
      setMessage({ type: "error", text: "Invalid Ethereum address format." })
      return
    }
    setActionLoading(true)
    setMessage(null)
    try {
      const result = await transferCredit(selectedCredit.id, newOwner.trim())
      setMessage({ type: "success", text: `Credit transferred. Tx: ${result.tx_hash.slice(0, 10)}...` })
      setSelectedId(null)
      setNewOwner("")
    } catch {
      setMessage({ type: "error", text: "Failed to transfer credit. Please try again." })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Portfolio Management"
        title="Manage Credits"
        intro="Retire or transfer credits from your portfolio. All actions are recorded permanently on-chain."
      />

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
              message.type === "success"
                ? "border-emerald/30 bg-emerald/10 text-emerald-bright"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Credit list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-paper">
                Active Credits ({activeCredits.length})
              </h2>
              <Link
                to="/registry"
                className="text-sm text-emerald-bright hover:underline"
              >
                View all credits
              </Link>
            </div>

            {loading ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-ink-2" />
                ))}
              </div>
            ) : activeCredits.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-line bg-ink-2 p-10 text-center">
                <p className="text-mute">No active credits available to manage.</p>
                <Link
                  to="/create"
                  className="mt-4 inline-flex items-center gap-2 text-emerald-bright"
                >
                  Issue a new credit <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {activeCredits.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      selectedId === c.id
                        ? "border-emerald bg-emerald/10"
                        : "border-line bg-ink-2 hover:border-line-2"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <StatusPill credit={c} />
                          <span className="font-mono text-xs text-mute">
                            #{c.id.toString().padStart(4, "0")}
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-paper">
                          {c.project}
                        </p>
                        <p className="mt-1 text-sm text-mute">
                          {categoryOf(c.project)} · {c.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-paper">
                          {formatNumber(volumeOf(c))}
                        </p>
                        <p className="text-xs text-mute">tCO₂e</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-line bg-ink-2 p-6">
              <h3 className="text-lg font-semibold text-paper">Actions</h3>
              {selectedCredit ? (
                <div className="mt-4">
                  <p className="font-medium text-paper">
                    {selectedCredit.project}
                  </p>
                  <p className="mt-1 text-sm text-mute">
                    {formatNumber(volumeOf(selectedCredit))} tCO₂e · #{selectedCredit.id}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-mute">
                    Owner:
                    <span className="font-mono text-paper">
                      {shortAddress(selectedCredit.owner)}
                    </span>
                    <CopyButton text={selectedCredit.owner} />
                  </p>

                  {/* Retire */}
                  <div className="mt-6 border-t border-line pt-6">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-sky-300" />
                      <h3 className="font-semibold text-paper">Retire Credit</h3>
                    </div>
                    <p className="mt-2 text-sm text-mute">
                      Permanently remove this credit from circulation. This
                      action cannot be undone.
                    </p>
                    <button
                      onClick={handleRetire}
                      disabled={actionLoading}
                      className="mt-4 w-full rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 font-medium text-sky-300 transition-colors hover:bg-sky-500/20 disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        "Retire Credit"
                      )}
                    </button>
                  </div>

                  {/* Transfer */}
                  <div className="mt-6 border-t border-line pt-6">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-emerald-bright" />
                      <h3 className="font-semibold text-paper">
                        Transfer Ownership
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-mute">
                      Transfer this credit to a new wallet address.
                    </p>
                    <input
                      type="text"
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      placeholder="0x..."
                      className="mt-3 w-full rounded-lg border border-line bg-ink px-3 py-2.5 font-mono text-sm text-paper outline-none transition-colors placeholder:text-mute focus:border-emerald"
                    />
                    <button
                      onClick={handleTransfer}
                      disabled={actionLoading || !newOwner.trim()}
                      className="mt-3 w-full rounded-lg bg-emerald px-4 py-2.5 font-medium text-ink transition-colors hover:bg-emerald-bright disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        "Transfer Credit"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-line p-8 text-center">
                  <ShieldCheck className="mx-auto h-8 w-8 text-mute" />
                  <p className="mt-4 text-mute">
                    Select a credit from the list to manage it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
