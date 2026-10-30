// Chapter 3 — "Сияние": browser games, each mirrored by a planet orbiting Solar.
import { ArrowUpRight } from 'lucide-react'
import type { Selection } from '../dialogs/ContentDialog'
import type { Game } from '../content'
import { Panel, Stage } from './Stage'

export function GamesStage({
  games,
  onSelect,
  onHighlight,
}: {
  games: Game[]
  onSelect: (s: Selection) => void
  onHighlight: (i: number | null) => void
}) {
  return (
    <Stage id="games" height="h-[300svh]">
      <Panel
        tone="light"
        chapterNo="03"
        eyebrow="Тридесятое царство"
        title="Сказочные игры"
        lead="Богатыри, Садко и Али-Баба ждут вас за седьмой сферой. Как планеты кружат вокруг ядра, так и игры кружат вокруг Солара — наведите на карточку и найдите её планету. Играйте прямо в браузере."
      >
        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
          {games.map((g, i) => (
            <button
              key={g.id}
              data-item={i}
              onClick={() => onSelect({ kind: 'game', item: g })}
              onMouseEnter={() => onHighlight(i)}
              onMouseLeave={() => onHighlight(null)}
              onFocus={() => onHighlight(i)}
              onBlur={() => onHighlight(null)}
              className="solar-tile-light group relative text-left rounded-2xl p-3 md:p-3.5"
            >
              <div className="flex items-start justify-between mb-3">
                {/* Planet orb with a thin orbit ring */}
                <span className="relative w-9 h-9">
                  <span
                    className="absolute inset-0 rounded-full transition-transform duration-500 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at 32% 28%, #fff 0%, ${g.color} 48%, ${g.color} 70%, rgba(42,31,61,0.25) 100%)`,
                      boxShadow: `0 6px 18px -4px ${g.color}`,
                    }}
                  />
                  <span className="absolute -inset-1.5 rounded-full border border-[#2a1f3d]/15 rotate-[-18deg] scale-y-[0.45]" />
                </span>
                {g.playable ? (
                  <span className="text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">Играть</span>
                ) : (
                  <span className="text-[10px] font-semibold rounded-full bg-[#2a1f3d]/[0.06] text-[#2a1f3d]/60 px-2 py-0.5">Скоро</span>
                )}
              </div>
              <div className="text-sm font-bold leading-snug pr-4">{g.title}</div>
              <div className="hidden sm:block text-xs text-[#2a1f3d]/60 mt-1 line-clamp-2">{g.description}</div>
              <ArrowUpRight className="absolute bottom-3 right-3 w-4 h-4 text-[#2a1f3d]/30 transition-all group-hover:text-[#2a1f3d]/70 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </Panel>
    </Stage>
  )
}
