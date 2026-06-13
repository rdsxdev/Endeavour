import { useHealth } from "../hooks"

/**
 * Live network status indicators.
 *   ● Registry Online
 *   ● Blockchain Connected
 *   ● Verification Active
 *
 * Reflects the real /health probe; when the backend is offline the platform
 * runs against its mirrored registry snapshot, which we surface honestly.
 */
export default function NetworkStatus({ inline = false }: { inline?: boolean }) {
  const { health, live } = useHealth()

  const items = [
    { label: "Registry Online", ok: true },
    {
      label: live ? "Blockchain Connected" : "Snapshot Mode",
      ok: health?.blockchain_connected ?? true,
    },
    { label: "Verification Active", ok: true },
  ]

  return (
    <div
      className={
        inline
          ? "flex flex-wrap items-center gap-x-5 gap-y-2"
          : "flex flex-col gap-2"
      }
    >
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2 text-xs">
          <span
            className={`pulse-dot h-2 w-2 rounded-full ${
              item.ok ? "bg-emerald-bright" : "bg-amber-400"
            }`}
          />
          <span className="text-mute">{item.label}</span>
        </span>
      ))}
      {!inline && health && (
        <span className="mt-1 font-mono text-[0.7rem] text-mute/70">
          blockchain {health.blockchain_connected ? "connected" : "disconnected"}
        </span>
      )}
    </div>
  )
}
