import { formatCompact } from "../api"

export default function AreaChart({
  data,
  color = "var(--color-emerald)",
  height = 200,
  label,
}: {
  data: { label: string; value: number }[]
  color?: string
  height?: number
  label?: string
}) {
  const width = 100
  const max = Math.max(...data.map((d) => d.value), 1)
  const padY = 4

  const coords = data.map((d, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * width
    const y = height - padY - (d.value / max) * (height - padY * 2)
    return { x, y, ...d }
  })

  const linePath = coords.map((c) => `${c.x},${c.y}`).join(" ")
  const areaPath = `M0,${height} L${coords.map((c) => `${c.x},${c.y}`).join(" L")} L${width},${height} Z`

  return (
    <div>
      {label && (
        <p className="mb-4 text-sm text-mute">{label}</p>
      )}
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-label={label}
        >
          <defs>
            <linearGradient id={`area-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#area-${color})`} />
          <polyline
            points={linePath}
            fill="none"
            stroke={color}
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex justify-between px-0.5">
          {data.map((d) => (
            <span key={d.label} className="font-mono text-[0.65rem] text-mute">
              {d.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <span className="font-mono text-xs text-mute">
          Peak {formatCompact(max)}
        </span>
      </div>
    </div>
  )
}
