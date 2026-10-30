// Epilogue (after the story track, Solar stays risen): epigraph → image of the world + path
// from thought to deed → the team's words and the call to support → footer.
// Each row is its own <section> so it reveals as it enters the viewport.
import { ArrowRight, Heart, HeartHandshake, Lightbulb, Sun, Sparkles } from 'lucide-react'
import { EPIGRAPH, PRINCIPLES, WORLD_PARABLE } from '../content'

const PRINCIPLE_ICONS = [Lightbulb, Sparkles, HeartHandshake]

/** A small egg cross-section: starry shell, white, glowing yolk and the Tree of Life thread. */
function EggDiagram() {
  return (
    <div aria-hidden className="relative w-[92px] h-[116px] shrink-0">
      <div className="absolute inset-0 rounded-[50%_50%_50%_50%/58%_58%_42%_42%] bg-gradient-to-b from-[#1d1747] to-[#100c28] shadow-[0_14px_30px_-12px_rgba(16,12,38,0.6)]">
        {[
          [22, 18],
          [64, 26],
          [40, 10],
          [74, 60],
          [16, 64],
          [56, 92],
        ].map(([x, y], i) => (
          <span key={i} className="absolute w-[3px] h-[3px] rounded-full bg-amber-200" style={{ left: x, top: y }} />
        ))}
      </div>
      <div className="absolute inset-[7px] rounded-[50%_50%_50%_50%/58%_58%_42%_42%] bg-[#fff8ee]" />
      <div className="absolute left-1/2 top-[14px] bottom-[50%] w-px -translate-x-1/2 bg-gradient-to-b from-emerald-500/70 to-amber-400" />
      <div className="absolute left-1/2 top-[54%] w-11 h-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_35%,#fff4d6,#ffd27a_45%,#ff9f6b)] shadow-[0_0_24px_6px_rgba(255,190,110,0.55)]" />
    </div>
  )
}

export function Epilogue({ onDonate }: { onDonate: () => void }) {
  return (
    <div id="support" className="relative mx-auto max-w-6xl w-full px-4 md:px-12 pt-[18svh] pb-8 text-[color:var(--s-ink)]">
      {/* Epigraph */}
      <section data-panel="reveal" className="text-center mb-14 md:mb-20">
        <div className="solar-eyebrow solar-eyebrow--light mb-4 justify-center">{EPIGRAPH.question}</div>
        <p className="solar-display text-3xl md:text-5xl font-bold leading-tight">
          <span className="solar-dawn-text">{EPIGRAPH.answer}</span>
        </p>
      </section>

      {/* Image of the world + the path from thought to deed */}
      <section data-panel="reveal" className="grid md:grid-cols-5 gap-4 md:gap-5 mb-4 md:mb-5">
        <article data-item={0} className="solar-glass-light md:col-span-2 rounded-[28px] p-6 md:p-7">
          <div className="flex items-start gap-5">
            <EggDiagram />
            <div>
              <div className="solar-eyebrow solar-eyebrow--light mb-2">Притча</div>
              <h3 className="solar-display text-xl md:text-2xl font-bold mb-1">Мир как яйцо</h3>
              <p className="text-sm text-[color:var(--s-ink-soft)]">Древний образ, в котором всё на своём месте.</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-2.5">
            {WORLD_PARABLE.map((row) => (
              <div key={row.part} className="flex gap-3 text-sm leading-snug">
                <dt className="w-[104px] shrink-0 font-bold">{row.part}</dt>
                <dd className="text-[color:var(--s-ink-soft)]">{row.meaning}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article data-item={1} className="solar-glass-light md:col-span-3 rounded-[28px] p-6 md:p-8 flex flex-col">
          <div className="solar-eyebrow solar-eyebrow--light mb-2">Как свет становится делом</div>
          <h3 className="solar-display text-xl md:text-2xl font-bold mb-5">Мысль · Чувство · Дело</h3>
          <ol className="grid sm:grid-cols-3 gap-3 mt-auto">
            {PRINCIPLES.map((pr, i) => {
              const Icon = PRINCIPLE_ICONS[i] ?? Sparkles
              return (
                <li key={pr.title} className="relative rounded-2xl bg-white/70 border border-[#2a1f3d]/[0.08] p-4">
                  <span className="flex items-center justify-between mb-3">
                    <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-gradient-to-br from-[#fff1c9] to-[#ffd27a]">
                      <Icon className="w-[18px] h-[18px] text-[color:var(--s-rust)]" />
                    </span>
                    <span className="solar-display text-xs font-bold text-[#2a1f3d]/30">0{i + 1}</span>
                  </span>
                  <div className="font-bold mb-1">{pr.title}</div>
                  <div className="text-sm text-[color:var(--s-ink-soft)] leading-snug">{pr.text}</div>
                  {i < PRINCIPLES.length - 1 && (
                    <ArrowRight className="hidden sm:block absolute top-1/2 -right-[14px] -translate-y-1/2 w-4 h-4 text-[#b8641f]/50" />
                  )}
                </li>
              )
            })}
          </ol>
        </article>
      </section>

      {/* The team's words + support */}
      <section data-panel="reveal">
        <article className="relative rounded-[28px] p-6 md:p-10 overflow-hidden bg-gradient-to-br from-[#fff4d6] via-[#ffe2bf] to-[#ffc9a8] border border-white/80 shadow-[0_40px_80px_-40px_rgba(184,100,31,0.55)] grid md:grid-cols-[1.4fr_1fr] gap-6 md:gap-10 items-center">
          <span aria-hidden className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,#fff8e6_0%,rgba(255,210,122,0.6)_35%,transparent_70%)]" />
          <div className="relative">
            <div className="solar-eyebrow solar-eyebrow--light mb-2">От сердца к сердцу</div>
            <h3 className="solar-display text-2xl md:text-4xl font-bold mb-5">Наш духовный порыв</h3>
            <p className="text-base md:text-lg leading-relaxed text-[#2a1f3d]/85 mb-3">
              Этот проект — наш духовный порыв: принести в этот мир благо. Все наши проекты сделаны на средства нашей команды.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-[#2a1f3d]/85">
              Если есть желание поддержать нас — каждый вклад помогает Солару светить ярче, а новым роликам, саммари и играм —
              появляться чаще.
            </p>
          </div>
          <div className="relative flex flex-col items-start md:items-center gap-3 md:text-center">
            <span className="hidden md:inline-flex w-20 h-20 items-center justify-center rounded-full bg-white/60 border border-white shadow-[0_0_40px_10px_rgba(255,210,122,0.5)]">
              <Heart className="w-9 h-9 fill-rose-400 text-rose-500" />
            </span>
            <button onClick={onDonate} className="solar-btn solar-btn--ink !px-7 !py-3.5">
              <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
              Поддержать проект
            </button>
            <span className="text-xs text-[#2a1f3d]/60">Любая сумма — это тоже свет</span>
          </div>
        </article>
      </section>

      <footer className="mt-10 pt-5 border-t border-[#2a1f3d]/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#2a1f3d]/55">
        <span className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5" />© {new Date().getFullYear()} Солар · знания, которые светят
        </span>
        <span>Сделано с теплом и светом</span>
      </footer>
    </div>
  )
}
