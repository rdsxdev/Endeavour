import { Link } from "react-router-dom"
import { formatCompact } from "../api"
import { type TokenPool, poolColor, poolLabel } from "../pools"
import Sparkline from "./Sparkline"

export default function PoolCard({ pool }: { pool: TokenPool }) {
  const utilization = Math.round(
    ((pool.totalSupply - pool.available) / pool.totalSupply) * 100,
  )
  const color = poolColor(pool.kind)

  return (
    <article className="surface flex flex-col overflow-hidden">
      <div
        className="h-1 w-full"
        style={{ background: color }}
        aria-hidden
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">{poolLabel(pool.kind)}</p>
            <h3 className="mt-1 font-serif text-xl text-paper">{pool.name}</h3>
            <p className="mt-0.5 font-mono text-xs text-mute">{pool.symbol}</p>
          </div>
          <Sparkline data={pool.trend} color={color} />
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-mute">
          {pool.description}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
          <div>
            <dt className="text-mute">Total supply</dt>
            <dd className="mt-0.5 font-mono font-medium text-paper">
              {formatCompact(pool.totalSupply)}{" "}
              <span className="text-mute">{pool.unit}</span>
            </dd>
          </div>
          <div>
            <dt className="text-mute">Available</dt>
            <dd className="mt-0.5 font-mono font-medium text-paper">
              {formatCompact(pool.available)}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-mute">
            <span>Utilisation</span>
            <span className="font-mono">{utilization}%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden bg-ink-3">
            <div
              className="h-full transition-all duration-1000"
              style={{ width: `${utilization}%`, background: color }}
            />
          </div>
        </div>

        {pool.apy !== undefined && (
          <p className="mt-4 text-xs text-mute">
            Indicative yield{" "}
            <span className="font-mono text-paper">{pool.apy}%</span> p.a.
          </p>
        )}

        <Link
          to="/analytics"
          className="mt-5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color }}
        >
          View pool analytics →
        </Link>
      </div>
    </article>
  )
}
