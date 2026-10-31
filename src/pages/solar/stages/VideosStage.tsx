// Chapter 1 — "Пробуждение": educational videos for kids and adults.
import { useState } from 'react'
import { Clock, Play } from 'lucide-react'
import { cn } from '../../../lib/shadcn/utils'
import type { Selection } from '../dialogs/ContentDialog'
import { ADULT_VIDEOS, KIDS_VIDEOS } from '../content'
import { Panel, Stage } from './Stage'

type Audience = 'kids' | 'adults'
const AUDIENCES: { id: Audience; label: string }[] = [
  { id: 'kids', label: 'Для детей' },
  { id: 'adults', label: 'Для взрослых' },
]

export function VideosStage({ onSelect }: { onSelect: (s: Selection) => void }) {
  const [audience, setAudience] = useState<Audience>('kids')
  const videos = audience === 'kids' ? KIDS_VIDEOS : ADULT_VIDEOS

  return (
    <Stage id="videos" height="h-[200svh]">
      <Panel
        tone="dark"
        chapterNo="01"
        eyebrow="Пробуждение"
        title="Познавательные ролики"
        lead="Короткие и добрые объяснения сложного — чтобы любопытство не засыпало, а память о простых чудесах возвращалась. Для детей и взрослых, которые не перестают учиться."
      >
        <div className="inline-flex rounded-full bg-white/[0.07] border border-white/10 p-1 mb-4" role="tablist" aria-label="Аудитория">
          {AUDIENCES.map((a) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={audience === a.id}
              onClick={() => setAudience(a.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300',
                audience === a.id ? 'bg-white text-[#1b1638] shadow-md' : 'text-white/70 hover:text-white',
              )}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="solar-scroller flex md:grid md:grid-cols-2 gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 pb-1">
          {videos.map((v, i) => (
            <button
              key={v.id}
              data-item={i}
              onClick={() => onSelect({ kind: 'video', item: v })}
              className="solar-tile-dark group shrink-0 w-[64%] sm:w-[44%] md:w-auto snap-start text-left rounded-2xl overflow-hidden"
            >
              <div className={cn('relative h-24 md:h-28 bg-gradient-to-br overflow-hidden', v.gradient)}>
                {/* soft light bloom + vignette for depth */}
                <span className="solar-bloom absolute -top-14 -left-14 w-40 h-40" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white/30 border border-white/40 transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </span>
                </span>
                <span className="absolute top-2 left-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-white/95">
                  {v.tag}
                </span>
                <span className="absolute bottom-2 right-2 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {v.duration}
                </span>
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold leading-snug line-clamp-2">{v.title}</div>
              </div>
            </button>
          ))}
        </div>
      </Panel>
    </Stage>
  )
}
