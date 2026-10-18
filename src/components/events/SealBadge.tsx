const PHRASE = 'FREE ENTRY · CSS EVENTS · REGISTER NOW · TICKETS BY EMAIL · '

/**
 * A slowly spinning circular stamp. Pure SVG so it scales; CSS rotation keeps it calm.
 */
export function SealBadge({
  className = '',
  size = 160,
}: {
  className?: string
  size?: number
}) {
  const r = (size - 20) / 2 - 6
  const circle = `M ${size / 2},${size / 2 - r} a ${r},${r} 0 1,1 0,${r * 2} a ${r},${r} 0 1,1 0,-${r * 2}`

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Free entry to all CSS events"
      className={`animate-[spin_70s_linear_infinite] ${className}`}
    >
      <defs>
        <path id="seal-path" d={circle} />
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r + 6}
        className="fill-surface-raised stroke-border"
        strokeWidth={1.5}
      />
      <text
        className="fill-brand"
        style={{ font: '600 10px/1 var(--font-mono)', letterSpacing: '0.22em' }}
      >
        <textPath href="#seal-path" startOffset="0%">
          {PHRASE.repeat(2)}
        </textPath>
      </text>
      <g transform={`translate(${size / 2 - 16}, ${size / 2 - 16})`} className="text-heading">
        <path
          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}
