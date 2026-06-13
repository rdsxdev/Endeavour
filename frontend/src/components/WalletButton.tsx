import { Wallet, Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useWallet } from "./WalletContext"
import { shortAddress } from "../api"

export default function WalletButton({ compact = false }: { compact?: boolean }) {
  const { address, connected, connecting, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)

  if (connected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-emerald/30 bg-emerald/10 px-3.5 py-2 text-sm font-medium text-emerald-bright transition-colors hover:bg-emerald/15"
        >
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-bright" />
          <span className="font-mono text-xs">{shortAddress(address)}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line-2 bg-ink-2 shadow-2xl">
              <div className="border-b border-line px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-widest text-mute">
                  Connected account
                </p>
                <p className="mt-1 font-mono text-xs text-paper">
                  {shortAddress(address)}
                </p>
              </div>
              <button
                onClick={() => {
                  disconnect()
                  setOpen(false)
                }}
                className="w-full px-4 py-3 text-left text-sm text-mute transition-colors hover:bg-ink-3 hover:text-paper"
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="flex items-center gap-2 rounded-lg bg-emerald px-4 py-2 text-sm font-semibold text-ink transition-all hover:bg-emerald-bright disabled:opacity-70"
    >
      {connecting ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
          Connecting
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          {compact ? "Connect" : "Connect Wallet"}
        </>
      )}
    </button>
  )
}

export function VerifiedBadge({ label = "Verified On-Chain" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 px-2.5 py-1 text-[0.7rem] font-medium text-emerald-bright">
      <Check className="h-3 w-3" />
      {label}
    </span>
  )
}
