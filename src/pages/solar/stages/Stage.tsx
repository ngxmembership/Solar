// Layout primitives for scroll stages: a tall section with a sticky viewport, and a content panel.
import type { ReactNode } from 'react'
import { cn } from '../../../lib/shadcn/utils'

export function Stage({
  id,
  height,
  layout = 'side',
  children,
}: {
  id: string
  /** Tailwind height class — controls how long the chapter lasts on scroll. */
  height: string
  layout?: 'side' | 'center'
  children: ReactNode
}) {
  return (
    <section id={id} className={cn('relative', height)}>
      <div
        className={cn(
          'sticky top-0 h-svh w-full mx-auto max-w-7xl px-4 md:px-12 flex',
          layout === 'center' ? 'items-center justify-center' : 'items-end md:items-center pb-4 md:pb-0',
        )}
      >
        {children}
      </div>
    </section>
  )
}

export function Panel({
  tone,
  chapterNo,
  eyebrow,
  title,
  lead,
  children,
}: {
  tone: 'dark' | 'light'
  chapterNo: string
  eyebrow: string
  title: string
  lead: string
  children: ReactNode
}) {
  const light = tone === 'light'
  return (
    <div
      data-panel="mid"
      className={cn(
        'relative w-full md:w-[50%] lg:w-[44%] rounded-[28px] p-5 md:p-8 overflow-hidden',
        light ? 'solar-glass-light' : 'solar-glass-dark',
      )}
    >
      {/* Oversized chapter numeral as a quiet watermark */}
      <span
        aria-hidden
        className={cn(
          'solar-display pointer-events-none absolute -top-3 right-3 md:right-5 text-[88px] md:text-[120px] font-bold leading-none select-none',
          light ? 'text-[#b8641f]/[0.08]' : 'text-white/[0.05]',
        )}
      >
        {chapterNo}
      </span>
      <div className={cn('solar-eyebrow mb-3', light && 'solar-eyebrow--light')}>{eyebrow}</div>
      <h2 className="solar-display text-[26px] md:text-[40px] font-bold mb-2.5 md:mb-3">{title}</h2>
      <p className={cn('text-sm md:text-base leading-relaxed mb-5 max-w-prose line-clamp-3 md:line-clamp-none', light ? 'text-[color:var(--s-ink-soft)]' : 'text-white/70')}>
        {lead}
      </p>
      {children}
    </div>
  )
}
