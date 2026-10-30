// Chapter 4 — "Наша миссия": Solar has risen like a sun; the mission is written in light.
import { BookOpen, ChevronDown, Gamepad2, Play } from 'lucide-react'
import { chapterTarget } from '../chapters'
import { Stage } from './Stage'

const TITLE = 'Наша миссия'

export function MissionStage({ onNav }: { onNav: (p: number) => void }) {
  return (
    <Stage id="mission" height="h-svh" layout="center">
      <div data-panel="end" className="w-full max-w-2xl h-full flex flex-col justify-end text-center text-[color:var(--s-ink)] pb-[7svh] px-2">
        <div data-item={0} className="solar-eyebrow solar-eyebrow--light justify-center mb-3">Выход на свет</div>
        <h2 className="solar-display text-[44px] md:text-[72px] font-bold mb-5" aria-label={TITLE}>
          {TITLE.split('').map((ch, i) => (
            <span key={i} data-letter={i} aria-hidden className="inline-block solar-dawn-text">
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </h2>
        <p data-item={1} className="text-base md:text-xl text-[color:var(--s-ink-soft)] leading-relaxed mb-7 max-w-xl mx-auto">
          Зажигать в людях любовь к знаниям — бережно, понятно и с теплом. Светить, как Солар: мягко, а не ослепляя, — чтобы каждый
          ребёнок и взрослый находил в себе свет и делился им с другими.
        </p>
        <div data-item={2} className="flex flex-wrap justify-center gap-2.5">
          <button onClick={() => onNav(chapterTarget('videos'))} className="solar-btn solar-btn--ink">
            <Play className="w-4 h-4" />
            Смотреть ролики
          </button>
          <button onClick={() => onNav(chapterTarget('books'))} className="solar-btn solar-btn--soft-light">
            <BookOpen className="w-4 h-4" />
            Читать саммари
          </button>
          <button onClick={() => onNav(chapterTarget('games'))} className="solar-btn solar-btn--soft-light">
            <Gamepad2 className="w-4 h-4" />
            Играть
          </button>
        </div>
        <div data-item={3} className="mt-8 flex flex-col items-center gap-1 text-xs font-medium text-[#2a1f3d]/50">
          И ещё немного о главном
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </Stage>
  )
}
