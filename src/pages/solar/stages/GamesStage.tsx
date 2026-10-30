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
        eyebrow="Сияние"
        title="Браузерные игры"
        lead="Как планеты кружат вокруг ядра, так наши игры кружат вокруг Солара. Наведите на карточку — и найдите её планету на орбите. Играйте прямо в браузере, без установки."
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
                    style=undefined
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
