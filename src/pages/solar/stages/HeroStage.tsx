// Chapter 0 — "Сон": two beats over the sealed, star-painted shell.
//  Beat 1: title.  Beat 2: prologue — why the shell is there and how the visitor wakes it.
import { BookOpen, Gamepad2, Play } from 'lucide-react'
import { PROLOGUE } from '../content'
import { Stage } from './Stage'

const PILLARS = [
  { icon: Play, label: 'Ролики' },
  { icon: BookOpen, label: 'Саммари' },
  { icon: Gamepad2, label: 'Игры' },
]

export function HeroStage() {
  return (
    <Stage id="hero" height="h-[200svh]" layout="center">
      <div className="relative w-full h-full">
        {/* Beat 1 — title (visible on load, leaves as the scroll begins) */}
        <div
          data-panel="beat"
          data-beat="-1,-1,0.05,0.4"
          className="absolute inset-0 flex flex-col items-center justify-between pt-20 md:pt-24 pb-6 text-center text-white"
        >
          <div className="solar-intro flex flex-col items-center gap-2.5 md:gap-3">
            <div className="solar-eyebrow">Место, где возвращается память о свете</div>
            <h1 className="solar-display solar-gold-text text-[clamp(52px,12svh,104px)] font-bold tracking-[-0.04em]">Солар</h1>
            <p className="text-base md:text-xl text-white/85 font-medium">Знания, которые светят</p>
            <ul className="mt-1 flex items-center gap-2">
              {PILLARS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/75">
                  <Icon className="w-3.5 h-3.5 text-amber-300" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="solar-intro flex flex-col items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-white/45">
            Листайте
            <div className="solar-scroll-cue" aria-hidden />
          </div>
        </div>

        {/* Beat 2 — prologue under the shell */}
        <div
          data-panel="beat"
          data-beat="0.42,0.66,0.95,1.25"
          className="absolute inset-x-0 bottom-0 pb-[6svh] flex flex-col items-center text-center px-6"
        >
          <div data-item={0} className="solar-eyebrow mb-4">
            Пролог
          </div>
          <div className="max-w-2xl flex flex-col gap-2">
            {PROLOGUE.map((line, i) => (
              <p key={i} data-item={i + 1} className="text-[15px] md:text-[17px] leading-relaxed text-white/85 text-balance">
                {line}
              </p>
            ))}
            <p data-item={PROLOGUE.length + 1} className="solar-display solar-gold-text text-lg md:text-2xl font-semibold mt-2">
              Добро пожаловать домой
            </p>
          </div>
        </div>
      </div>
    </Stage>
  )
}
