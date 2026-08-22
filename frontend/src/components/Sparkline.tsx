/** Minimal SVG sparkline — no chart library dependency. */
export default function Sparkline({
  data,
  color = "var(--color-emerald)",
  width = 88,
  height = 36,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2)
      const y = height - pad - ((v - min) / range) * (height - pad * 2)
      return `${x},${y}`
    })
    .join(" ")

  const last = data[data.length - 1]!
  const lastX = width - pad
  const lastY = height - pad - ((last - min) / range) * (height - pad * 2)

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="shrink-0"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  )
}
