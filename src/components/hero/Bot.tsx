import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import './Bot.css'

export type BotStatus = 'ready' | 'printing' | 'away' | 'doctor'

/** Which way the bot is looking: x is left/right, y is up/down, each -1 to 1. */
export interface BotLook {
  x?: number
  y?: number
}

interface BotProps {
  status?: BotStatus
  color?: string
  className?: string
  /** Shifts the eyes and turns the head toward this direction. */
  look?: BotLook
  /** Ornament only: hidden from assistive tech and not a click target. */
  decorative?: boolean
}

const clamp = (value: number | undefined) => Math.max(-1, Math.min(1, value ?? 0))

const BODY_PATH = 'M37 85 C37 74 83 74 83 85 C83 108 72 121 60 121 C48 121 37 108 37 85 Z'

type Ids = Record<
  'shell' | 'shade' | 'bounce' | 'rim' | 'visor' | 'bezel' | 'glass' | 'glow' | 'dots' | 'eyeMask' | 'soft' | 'softer' | 'haze' | 'bodyClip',
  string
>

const line: CSSProperties = { stroke: 'var(--bot-line)' }

/** A small rounded mitt: wrist joint, three fingers, a thumb and a lit palm. */
function Hand({ side, ids }: { side: 'left' | 'right'; ids: Ids }) {
  const d = side === 'left' ? 1 : -1 // +1 = thumb points right (toward the body)
  const cx = side === 'left' ? 20.5 : 99.5
  const cy = 115
  const jointX = side === 'left' ? 22.1 : 97.9

  return (
    <g className={`bot-hand ${side}`}>
      {/* wrist joint: a dark collar so the hand reads as a separate part */}
      <ellipse
        cx={jointX}
        cy="106.4"
        rx="5.4"
        ry="2.3"
        transform={`rotate(${d * 14} ${jointX} 106.4)`}
        fill={`url(#${ids.visor})`}
        style={line}
        strokeWidth=".5"
      />

      {/* thumb, tucked behind the palm */}
      <g transform={`rotate(${d * -26} ${cx + d * 6} ${cy - 1})`}>
        <ellipse cx={cx + d * 6} cy={cy - 1} rx="2.7" ry="4.3" fill={`url(#${ids.shell})`} style={line} strokeWidth=".6" />
        <ellipse cx={cx + d * 6} cy={cy - 1} rx="2.7" ry="4.3" fill={`url(#${ids.shade})`} />
      </g>

      {/* fingers, fanned slightly */}
      {[-1, 0, 1].map((i) => {
        const fx = cx + i * 3.7
        const fy = cy + 5.6 + (i === 0 ? 0.8 : 0)
        const ry = i === 0 ? 4.2 : 3.6
        return (
          <g key={i} transform={`rotate(${i * 13} ${fx} ${cy + 2})`}>
            <ellipse cx={fx} cy={fy} rx="2.4" ry={ry} fill={`url(#${ids.shell})`} style={line} strokeWidth=".6" />
            <ellipse cx={fx} cy={fy} rx="2.4" ry={ry} fill={`url(#${ids.shade})`} />
          </g>
        )
      })}

      {/* palm */}
      <ellipse cx={cx} cy={cy} rx="6.9" ry="6.5" fill={`url(#${ids.shell})`} style={line} strokeWidth=".7" />
      <ellipse cx={cx} cy={cy} rx="6.9" ry="6.5" fill={`url(#${ids.shade})`} />
      <ellipse cx={cx} cy={cy} rx="6.9" ry="6.5" fill={`url(#${ids.bounce})`} />
      <ellipse
        cx={cx - d * 2}
        cy={cy - 3}
        rx="2.4"
        ry="1.3"
        transform={`rotate(${d * -25} ${cx - d * 2} ${cy - 3})`}
        fill="#fff"
        opacity=".75"
        filter={`url(#${ids.softer})`}
      />
    </g>
  )
}

export function Bot({
  status = 'ready',
  color = 'var(--brand)',
  className = '',
  look,
  decorative = false,
}: BotProps) {
  const [isBooping, setIsBooping] = useState(false)
  // Unique per instance so several bots on one page don't share gradient/mask ids.
  const uid = useId().replace(/:/g, '')

  const ids: Ids = {
    shell: `bot${uid}Shell`,
    shade: `bot${uid}Shade`,
    bounce: `bot${uid}Bounce`,
    rim: `bot${uid}Rim`,
    visor: `bot${uid}Visor`,
    bezel: `bot${uid}Bezel`,
    glass: `bot${uid}Glass`,
    glow: `bot${uid}Glow`,
    dots: `bot${uid}Dots`,
    eyeMask: `bot${uid}EyeMask`,
    soft: `bot${uid}Soft`,
    softer: `bot${uid}Softer`,
    haze: `bot${uid}Haze`,
    bodyClip: `bot${uid}BodyClip`,
  }

  const handleBoop = () => {
    if (isBooping) return
    setIsBooping(true)
    window.setTimeout(() => setIsBooping(false), 1000)
  }

  const lx = clamp(look?.x)
  const ly = clamp(look?.y)

  const containerStyle = {
    '--bot-glow': color,
    '--bot-look-x': `${(lx * 3.4).toFixed(2)}px`,
    '--bot-look-y': `${(ly * 3.2).toFixed(2)}px`,
    '--bot-look-tilt': `${(lx * 7).toFixed(2)}deg`,
    '--bot-look-drop': `${(Math.max(0, ly) * 2.6).toFixed(2)}px`,
  } as CSSProperties

  return (
    <div
      className={`bot-container ${status} ${isBooping ? 'boop' : ''} ${className}`.trim()}
      style={containerStyle}
    >
      <svg
        viewBox="0 0 120 132"
        className="bot-svg"
        onClick={handleBoop}
        role={decorative ? 'presentation' : 'img'}
        aria-label={decorative ? undefined : 'Interactive Bot Illustration'}
        aria-hidden={decorative || undefined}
      >
        <defs>
          {/* base shell: highlight -> tint -> brand */}
          <radialGradient id={ids.shell} cx=".36" cy=".2" r=".98">
            <stop offset="0" style={{ stopColor: 'var(--bot-shell-hi)' }} />
            <stop offset=".5" style={{ stopColor: 'var(--bot-shell-mid)' }} />
            <stop offset="1" style={{ stopColor: 'var(--bot-shell-lo)' }} />
          </radialGradient>

          {/* form shadow: key light is top-left, so the lower right falls into shade */}
          <linearGradient id={ids.shade} x1=".15" y1=".05" x2=".85" y2="1">
            <stop offset=".35" style={{ stopColor: 'var(--bot-line)', stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: 'var(--bot-line)', stopOpacity: 0.6 }} />
          </linearGradient>

          {/* bounce light: cool light reflected back onto the underside */}
          <radialGradient id={ids.bounce} cx=".78" cy=".98" r=".55">
            <stop offset="0" style={{ stopColor: 'var(--bot-shell-mid)', stopOpacity: 0.7 }} />
            <stop offset="1" style={{ stopColor: 'var(--bot-shell-mid)', stopOpacity: 0 }} />
          </radialGradient>

          {/* thin rim light along the upper-left edge */}
          <linearGradient id={ids.rim} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".95" />
            <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          {/* dark parts: visor, neck, wrist joints */}
          <radialGradient id={ids.visor} cx=".5" cy=".35" r=".75">
            <stop offset="0" style={{ stopColor: 'var(--bot-visor-hi)' }} />
            <stop offset=".7" style={{ stopColor: 'var(--bot-visor)' }} />
            <stop offset="1" style={{ stopColor: 'var(--bot-visor-deep)' }} />
          </radialGradient>

          {/* bevel around the visor: shadowed on top, lit on the bottom lip */}
          <linearGradient id={ids.bezel} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--bot-line)' }} />
            <stop offset=".55" style={{ stopColor: 'var(--bot-shell-lo)' }} />
            <stop offset="1" style={{ stopColor: 'var(--bot-shell-hi)' }} />
          </linearGradient>

          {/* glass reflection across the visor */}
          <linearGradient id={ids.glass} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".34" />
            <stop offset="1" stopColor="#fff" stopOpacity=".03" />
          </linearGradient>

          <radialGradient id={ids.glow} cx=".5" cy=".5" r=".5">
            <stop offset="0" style={{ stopColor: 'var(--bot-glow)', stopOpacity: 0.95 }} />
            <stop offset="1" style={{ stopColor: 'var(--bot-glow)', stopOpacity: 0 }} />
          </radialGradient>

          <pattern id={ids.dots} width="1.9" height="1.9" patternUnits="userSpaceOnUse">
            <circle cx=".95" cy=".95" r=".72" style={{ fill: 'var(--bot-eye)' }} />
          </pattern>

          <mask id={ids.eyeMask}>
            <path
              d="M42.5 45 Q49 35 55.5 45 M64.5 45 Q71 35 77.5 45"
              fill="none"
              stroke="#fff"
              strokeWidth="5.6"
              strokeLinecap="round"
            />
          </mask>

          <filter id={ids.soft} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id={ids.softer} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation=".7" />
          </filter>
          <filter id={ids.haze} x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation="1.7" />
          </filter>

          <clipPath id={ids.bodyClip}>
            <path d={BODY_PATH} />
          </clipPath>
        </defs>

        {/* thruster glow */}
        <ellipse cx="60" cy="126" rx="18" ry="5" fill={`url(#${ids.glow})`} className="bot-thrust" />

        {/* arms + hands (behind the body) */}
        <g className="bot-arm left">
          <ellipse
            cx="25"
            cy="95"
            rx="9"
            ry="16"
            transform="rotate(14 25 95)"
            fill={`url(#${ids.shell})`}
            style={line}
            strokeWidth=".7"
          />
          <ellipse cx="25" cy="95" rx="9" ry="16" transform="rotate(14 25 95)" fill={`url(#${ids.shade})`} />
          <Hand side="left" ids={ids} />
        </g>
        <g className="bot-arm right">
          <ellipse
            cx="95"
            cy="95"
            rx="9"
            ry="16"
            transform="rotate(-14 95 95)"
            fill={`url(#${ids.shell})`}
            style={line}
            strokeWidth=".7"
          />
          <ellipse cx="95" cy="95" rx="9" ry="16" transform="rotate(-14 95 95)" fill={`url(#${ids.shade})`} />
          <Hand side="right" ids={ids} />
        </g>

        {/* neck: a dark connector so the head sits on the body, not beside it */}
        <ellipse cx="60" cy="74" rx="10.5" ry="5.5" fill={`url(#${ids.visor})`} style={line} strokeWidth=".5" />

        {/* body */}
        <path d={BODY_PATH} fill={`url(#${ids.shell})`} style={line} strokeWidth=".7" />
        <path d={BODY_PATH} fill={`url(#${ids.shade})`} />
        <path d={BODY_PATH} fill={`url(#${ids.bounce})`} />
        <path d={BODY_PATH} fill="none" stroke={`url(#${ids.rim})`} strokeWidth="1.1" opacity=".8" />
        <ellipse
          cx="47.5"
          cy="88"
          rx="4.6"
          ry="9"
          transform="rotate(14 47.5 88)"
          fill="#fff"
          opacity=".6"
          filter={`url(#${ids.softer})`}
        />

        {/* head's cast shadow, clipped to the body */}
        <g clipPath={`url(#${ids.bodyClip})`}>
          <ellipse
            cx="60"
            cy="79"
            rx="23"
            ry="6.5"
            filter={`url(#${ids.soft})`}
            opacity=".5"
            style={{ fill: 'var(--bot-line)' }}
          />
        </g>

        {/* chest core: recessed socket with a lit centre */}
        <circle cx="60" cy="95" r="7.6" fill={`url(#${ids.visor})`} style={line} strokeWidth=".5" />
        <path d="M54.4 98.6 A7.6 7.6 0 0 0 65.6 98.6" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth=".8" strokeLinecap="round" />
        <circle cx="60" cy="94.6" r="6.4" fill={`url(#${ids.glow})`} />
        <circle cx="60" cy="94.6" r="4.6" fill="none" style={{ stroke: 'var(--bot-eye)', strokeWidth: 1.3 }} />
        <circle cx="60" cy="94.6" r="1.5" style={{ fill: 'var(--bot-eye)' }} />

        {/* head */}
        <g className="bot-head">
          <g className="bot-head-look">
            {/* ear pods, mostly hidden behind the shell */}
            {[22.5, 97.5].map((ex) => (
              <g key={ex}>
                <ellipse cx={ex} cy="42" rx="5.6" ry="10" fill={`url(#${ids.shell})`} style={line} strokeWidth=".6" />
                <ellipse cx={ex} cy="42" rx="5.6" ry="10" fill={`url(#${ids.shade})`} />
                <ellipse cx={ex + (ex < 60 ? -1.4 : 1.4)} cy="42" rx="2.2" ry="5.6" fill={`url(#${ids.visor})`} />
              </g>
            ))}

            {/* shell */}
            <ellipse cx="60" cy="38" rx="37" ry="32" fill={`url(#${ids.shell})`} style={line} strokeWidth=".7" />
            <ellipse cx="60" cy="38" rx="37" ry="32" fill={`url(#${ids.shade})`} />
            <ellipse cx="60" cy="38" rx="37" ry="32" fill={`url(#${ids.bounce})`} />
            <ellipse cx="60" cy="38" rx="36.2" ry="31.2" fill="none" stroke={`url(#${ids.rim})`} strokeWidth="1.2" opacity=".85" />
            <ellipse
              cx="38"
              cy="17"
              rx="11"
              ry="4.6"
              transform="rotate(-30 38 17)"
              fill="#fff"
              opacity=".85"
              filter={`url(#${ids.softer})`}
            />

            {/* visor bezel, visor and glass */}
            <ellipse cx="60" cy="42.4" rx="29.6" ry="22" fill={`url(#${ids.bezel})`} />
            <ellipse cx="60" cy="42" rx="27.6" ry="20.2" style={{ fill: 'var(--bot-visor)' }} />
            <ellipse cx="60" cy="42" rx="27.6" ry="20.2" fill={`url(#${ids.visor})`} />

            {/* eyes: soft emissive glow under the dot-matrix */}
            <g className="bot-eyes">
              <g filter={`url(#${ids.haze})`} opacity=".7">
                <rect x="38" y="34" width="44" height="14" mask={`url(#${ids.eyeMask})`} style={{ fill: 'var(--bot-glow)' }} />
              </g>
              <rect x="38" y="34" width="44" height="14" fill={`url(#${ids.dots})`} mask={`url(#${ids.eyeMask})`} />
            </g>

            <path
              d="M40 33 C43 27 52 24 62 24.2 C52 27.5 46 34 44.5 41 C41.5 40 39 37 40 33Z"
              fill={`url(#${ids.glass})`}
            />
            <path d="M39 51 Q60 64 81 51" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        </g>
      </svg>
      <div className="bot-shadow" />
    </div>
  )
}
