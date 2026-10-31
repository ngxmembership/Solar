// Chapter 2 — "Рост": self-development book summaries.
import { cn } from '../../../lib/shadcn/utils'
import type { Selection } from '../dialogs/ContentDialog'
import { BOOKS } from '../content'
import { Panel, Stage } from './Stage'

export function BooksStage({ onSelect }: { onSelect: (s: Selection) => void }) {
  return (
    <Stage id="books" height="h-[300svh]">
      <Panel
        tone="dark"
        chapterNo="02"
        eyebrow="Рост"
        title="Саммари книг"
        lead="Главные идеи книг о саморазвитии за 10–15 минут. Каждая прочитанная книга — ещё одна трещинка в скорлупе, сквозь которую пробивается свет."
      >
        <div className="solar-scroller flex md:grid md:grid-cols-2 gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 pb-1">
          {BOOKS.map((b, i) => (
            <button
              key={b.id}
              data-item={i}
              onClick={() => onSelect({ kind: 'book', item: b })}
              className="solar-tile-dark group shrink-0 w-[44%] sm:w-[32%] md:w-auto snap-start text-left flex flex-col md:flex-row gap-3 rounded-2xl p-2.5"
            >
              {/* Book cover with spine and title */}
              <div
                className={cn(
                  'relative shrink-0 w-full md:w-[68px] aspect-[3/4] md:aspect-auto md:h-[92px] rounded-[6px_10px_10px_6px] bg-gradient-to-br overflow-hidden',
                  'shadow-[0_14px_28px_-12px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:-rotate-2 group-hover:-translate-y-0.5',
                  b.cover,
                )}
              >
                <span className="absolute inset-y-0 left-0 w-2 bg-black/15" />
                <span className="absolute inset-y-0 left-2 w-px bg-white/40" />
                <span className="solar-bloom absolute -top-8 -right-8 w-24 h-24" />
                <span className="absolute inset-x-2.5 bottom-2 text-[9px] font-bold leading-tight text-[#2a1f3d]/85 line-clamp-3 md:hidden">
                  {b.title}
                </span>
              </div>
              <div className="min-w-0 flex flex-col">
                <div className="text-sm font-semibold leading-snug line-clamp-2">{b.title}</div>
                <div className="text-xs text-white/60 mt-1">{b.author}</div>
                <div className="mt-auto pt-2 text-[11px] font-semibold text-amber-200/90">{b.minutes} мин чтения</div>
              </div>
            </button>
          ))}
        </div>
      </Panel>
    </Stage>
  )
}
