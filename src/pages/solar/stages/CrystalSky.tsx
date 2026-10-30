// "Небесный хрусталь": a night-enamel card with an engraved diagram of the seven crystal spheres
// (colours of the rainbow, notes do–si), the Moon's crescent as the first gate and Solar at the heart.
// Pure SVG + one CSS rotation — no images, crisp at any size, almost free to render.
import { Moon } from 'lucide-react'
import { CRYSTAL_SKY } from '../content'
import { SPHERE_COLORS } from '../scene/spheres'

const C = 170
const radius = (i: number) => 150 - i * 16

function SpheresDiagram() {
  return (
    <svg viewBox="0 0 340 340" className="w-full max-w-[340px] mx-auto" role="img" aria-label="Схема: семь хрустальных сфер вокруг Солара">
      <defs>
        <radialGradient id="cs-sun" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff8e6" />
          <stop offset="45%" stopColor="#ffd27a" />
          <stop offset="100%" stopColor="#ff8a4a" />
        </radialGradient>
        <radialGradient id="cs-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,200,120,0.55)" />
          <stop offset="100%" stopColor="rgba(255,200,120,0)" />
        </radialGradient>
        <filter id="cs-bead" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      <circle cx={C} cy={C} r={92} fill="url(#cs-glow)" />

      {/* Seven spheres — slowly turning, like an armillary of crystal */}
      <g className="solar-orbit-spin">
        {SPHERE_COLORS.map((color, i) => {
          const r = radius(i)
          const a = ((-90 + 35 + i * 47) * Math.PI) / 180
          const bx = C + Math.cos(a) * r
          const by = C + Math.sin(a) * r
          return (
            <g key={color}>
              <circle cx={C} cy={C} r={r + 2.5} fill="none" stroke={color} strokeOpacity={0.18} strokeWidth={0.8} strokeDasharray="1.5 4" />
              <circle cx={C} cy={C} r={r} fill="none" stroke={color} strokeOpacity={0.75} strokeWidth={1.1} />
              <circle cx={bx} cy={by} r={5} fill={color} opacity={0.5} filter="url(#cs-bead)" />
              <circle cx={bx} cy={by} r={2.6} fill={color} />
              <text x={bx + 7} y={by + 3} fontSize={9} fill={color} fillOpacity={0.9} fontFamily="Manrope, sans-serif" fontWeight={700}>
                {CRYSTAL_SKY.notes[i]}
              </text>
            </g>
          )
        })}
      </g>

      {/* The Moon's gate on the outermost sphere: entrance from the sublunar world */}
      <g transform={`translate(${C} ${C - radius(0)})`}>
        <circle r={11} fill="#100c26" stroke="#e3b75e" strokeWidth={1} />
        <path d="M3 -7 A7.5 7.5 0 1 0 3 7 A5.6 5.6 0 1 1 3 -7 Z" fill="#f2cf7a" />
      </g>
      <text x={C} y={C - radius(0) - 18} textAnchor="middle" fontSize={9.5} letterSpacing="2" fill="#f2cf7a" fontFamily="Manrope, sans-serif" fontWeight={700}>
        МЕСЯЦ
      </text>

      {/* Solar at the heart */}
      <circle cx={C} cy={C} r={30} fill="url(#cs-sun)" />
      <circle cx={C} cy={C} r={34} fill="none" stroke="#ffd27a" strokeOpacity={0.5} strokeWidth={0.8} />
      <text x={C} y={C + 4} textAnchor="middle" fontSize={10.5} letterSpacing="1.5" fill="#7a3f2a" fontFamily="Unbounded, Manrope, sans-serif" fontWeight={700}>
        СОЛАР
      </text>
    </svg>
  )
}

export function CrystalSky() {
  return (
    <section data-panel="reveal" className="mb-4 md:mb-5">
      <article className="relative overflow-hidden rounded-[28px] p-6 md:p-10 text-white bg-[radial-gradient(120%_120%_at_20%_20%,#2a1f5a_0%,#1b1638_45%,#100c26_100%)] border border-[#e3b75e]/25 shadow-[0_40px_90px_-40px_rgba(16,12,38,0.85)] grid md:grid-cols-[1fr_1.1fr] gap-8 md:gap-12 items-center">
        {/* engraved gold corner rules */}
        <span aria-hidden className="absolute inset-3 rounded-[22px] border border-[#e3b75e]/10 pointer-events-none" />
        <div data-item={0}>
          <SpheresDiagram />
        </div>
        <div data-item={1} className="relative">
          <div className="solar-eyebrow mb-3">{CRYSTAL_SKY.eyebrow}</div>
          <h3 className="solar-display solar-gold-text text-3xl md:text-5xl font-bold mb-5">{CRYSTAL_SKY.title}</h3>
          <p className="text-base md:text-lg leading-relaxed text-white/80 mb-4">{CRYSTAL_SKY.lead}</p>
          <p className="flex gap-3 text-sm md:text-[15px] leading-relaxed text-white/65 mb-6">
            <Moon className="w-5 h-5 shrink-0 mt-0.5 text-[#f2cf7a]" />
            {CRYSTAL_SKY.path}
          </p>
          <ul className="flex flex-wrap gap-2">
            {CRYSTAL_SKY.echoes.map((e, i) => (
              <li
                key={e}
                className="rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ borderColor: `${SPHERE_COLORS[(i * 2) % 7]}55`, color: SPHERE_COLORS[(i * 2) % 7] }}
              >
                {e}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  )
}
