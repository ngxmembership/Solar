// Desktop chapter rail: vertical dots on the right edge showing where you are in the story.
import { cn } from '../../../lib/shadcn/utils'
import { CHAPTERS } from '../chapters'

export function ChapterRail({ light, chapter, onNav }: { light: boolean; chapter: number; onNav: (p: number) => void }) {
  return (
    <nav aria-label="Глава истории" className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-4">
      {CHAPTERS.map((c, i) => {
        const active = i === chapter
        return (
          <button
            key={c.id}
            onClick={() => onNav(c.target)}
            aria-current={active ? 'step' : undefined}
            className="group flex items-center gap-3"
          >
            <span
              className={cn(
                'text-xs font-semibold tracking-wide transition-all duration-300',
                active ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-80 group-hover:translate-x-0',
                light ? 'text-[color:var(--s-ink)]' : 'text-white',
              )}
            >
              {c.label}
            </span>
            <span
              className={cn(
                'block rounded-full transition-all duration-500',
                active ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5',
                active
                  ? 'bg-[color:var(--s-gold)] shadow-[0_0_14px_4px_rgba(255,210,122,0.55)]'
                  : light
                    ? 'bg-[#2a1f3d]/30 group-hover:bg-[#2a1f3d]/60'
                    : 'bg-white/35 group-hover:bg-white/70',
              )}
            />
          </button>
        )
      })}
    </nav>
  )
}
