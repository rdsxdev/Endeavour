interface LogoProps {
  className?: string
  showWordmark?: boolean
  inverted?: boolean
}

export default function Logo({
  className = "",
  showWordmark = true,
  inverted = false,
}: LogoProps) {
  const stroke = inverted ? "#fafaf8" : "var(--color-emerald)"
  const fill = inverted ? "#fafaf8" : "var(--color-emerald)"
  const textClass = inverted ? "text-ink" : "text-paper"

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
        <path
          d="M16 1.5 28.5 8.75v14.5L16 30.5 3.5 23.25V8.75L16 1.5Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M16 9c-3.6 1.2-6 4.3-6 8.2 0 1.7.5 3.2 1.3 4.5C12.8 18.4 15.6 16 19 15c-2 2.4-3.2 5.2-3.4 8.5h1.8c.2-4.3 2.4-8 5.6-10.2C21.7 10.4 18.9 9 16 9Z"
          fill={fill}
        />
      </svg>
      {showWordmark && (
        <span className={`text-[1.05rem] font-semibold tracking-tight ${textClass}`}>
          Endeavour
        </span>
      )}
    </span>
  )
}
