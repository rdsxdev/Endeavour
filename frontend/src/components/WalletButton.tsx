import { Wallet, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useWallet } from "./WalletContext"
import { shortAddress } from "../api"

export default function WalletButton({
  compact = false,
  inverted = false,
}: {
  compact?: boolean
  inverted?: boolean
}) {
  const { address, connected, connecting, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)

  if (connected && address) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-2 border px-3.5 py-2 text-sm font-medium transition-colors ${
            inverted
              ? "border-white/25 text-white hover:border-white/40"
              : "border-emerald/30 bg-emerald/8 text-emerald-deep hover:bg-emerald/12"
          }`}
        >
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-bright" />
          <span className="font-mono text-xs">{shortAddress(address)}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden border border-line bg-ink">
              <div className="border-b border-line px-4 py-3">
                <p className="label">Connected</p>
                <p className="mt-1 font-mono text-xs text-paper">{shortAddress(address)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  disconnect()
                  setOpen(false)
                }}
                className="w-full px-4 py-3 text-left text-sm text-mute hover:bg-ink-2 hover:text-paper"
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
      type="button"
      onClick={connect}
      disabled={connecting}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition disabled:opacity-70 ${
        inverted
          ? "border border-white/30 text-white hover:border-white/50"
          : "bg-emerald text-white hover:bg-emerald-deep"
      }`}
    >
      {connecting ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
          Connecting
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          {compact ? "Connect" : "Connect wallet"}
        </>
      )}
    </button>
  )
}
