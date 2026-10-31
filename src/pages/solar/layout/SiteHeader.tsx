// Fixed header: logo, chapter nav, sound toggle, "Поддержать" CTA and the scroll progress hairline.
import type { Ref } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessagesSquare, Sun, Volume2, VolumeX } from 'lucide-react'
import { cn } from '../../../lib/shadcn/utils'
import { CHAPTERS } from '../chapters'
import { MobileMenu } from './MobileMenu'

interface Props {
  light: boolean
  scrolled: boolean
  chapter: number
  barRef: Ref<HTMLDivElement>
  onNav: (progress: number) => void
  onDonate: () => void
  soundOn: boolean
  onToggleSound: () => void
}

const NAV = CHAPTERS.filter((c) => c.id !== 'hero')

export function SiteHeader({ light, scrolled, chapter, barRef, onNav, onDonate, soundOn, onToggleSound }: Props) {
  return (
    <header className={cn('fixed top-0 inset-x-0 z-40 transition-colors duration-500', light ? 'text-[color:var(--s-ink)]' : 'text-white')}>
      <div
        className={cn(
          'absolute inset-0 -z-10 transition-[opacity,background-color,border-color] duration-500',
          scrolled ? 'opacity-100' : 'opacity-0',
          light
            ? 'bg-[#fff8ee]/85 border-b border-white/60'
            : 'bg-[#100c26]/80 border-b border-white/5',
        )}
      />
      <div className="mx-auto max-w-7xl px-4 md:px-12 h-16 flex items-center justify-between gap-4">
        <button onClick={() => onNav(0)} className="group flex items-center gap-2.5" aria-label="Солар — наверх">
          <span className="relative flex items-center justify-center w-8 h-8">
            <span
              className={cn('absolute -inset-1 rounded-full transition-opacity', light ? 'opacity-100' : 'opacity-70')}
              style={{background: 'radial-gradient(circle, rgba(252,211,77,0.55), rgba(252,211,77,0) 70%)' }}
            />
            <Sun className={cn('relative w-6 h-6 transition-transform duration-700 group-hover:rotate-90', light ? 'text-[color:var(--s-ember)]' : 'text-amber-300')} />
          </span>
          <span className="solar-display text-lg font-bold tracking-tight">Солар</span>
        </button>

        <nav aria-label="Разделы" className="hidden md:flex items-center gap-1 rounded-full p-1">
          {NAV.map((c) => {
            const active = CHAPTERS[chapter]?.id === c.id
            return (
              <button
                key={c.id}
                onClick={() => onNav(c.target)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  active
                    ? light
                      ? 'bg-[color:var(--s-ink)] text-white'
                      : 'bg-white/15 text-white'
                    : light
                      ? 'text-[color:var(--s-ink-soft)] hover:text-[color:var(--s-ink)] hover:bg-black/5'
                      : 'text-white/70 hover:text-white hover:bg-white/10',
                )}
              >
                {c.label}
              </button>
            )
          })}
          <span aria-hidden className={cn('mx-1 h-4 w-px', light ? 'bg-[#2a1f3d]/15' : 'bg-white/20')} />
          <Link
            to="/forum"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              light ? 'text-[color:var(--s-ink-soft)] hover:text-[color:var(--s-ink)] hover:bg-black/5' : 'text-white/70 hover:text-white hover:bg-white/10',
            )}
          >
            <MessagesSquare className="w-4 h-4" />
            Форум
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Выключить звук' : 'Включить фоновый звук'}
            title={soundOn ? 'Выключить звук' : 'Включить фоновый звук'}
            className={cn(
              'relative inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors',
              light ? 'border-[#2a1f3d]/15 bg-white/50 hover:bg-white' : 'border-white/15 bg-white/[0.06] hover:bg-white/15',
            )}
          >
            {soundOn ? <Volume2 className="w-[18px] h-[18px] text-amber-400" /> : <VolumeX className="w-[18px] h-[18px] opacity-70" />}
          </button>
          <button onClick={onDonate} aria-label="Поддержать проект" className="solar-btn solar-btn--sun !px-3 sm:!px-4 !py-2">
            <Heart className="w-4 h-4 fill-rose-500/80 text-rose-600" />
            <span className="hidden sm:inline">Поддержать</span>
          </button>
          <MobileMenu light={light} chapter={chapter} onNav={onNav} onDonate={onDonate} />
        </div>
      </div>
      <div className="h-px w-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full origin-left bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </header>
  )
}
