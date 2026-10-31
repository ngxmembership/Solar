// Small shared pieces: avatar, section chip, loading/empty/error states.
import { useState, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '../../../lib/shadcn/utils'
import type { ForumPerson } from '../model'
import type { ForumSection } from '../sections'

export function Avatar({ person, size = 36, className }: { person: ForumPerson | null; size?: number; className?: string }) {
  const [broken, setBroken] = useState(false)
  const style = { width: size, height: size }
  if (!person || broken) {
    return (
      <span
        aria-hidden
        style={style}
        className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fff1c9] to-[#ffc97a] text-[#9a5a14] font-bold', className)}
      >
        {(person?.login[0] ?? '·').toUpperCase()}
      </span>
    )
  }
  return (
    <img
      src={`${person.avatar}${person.avatar.includes('?') ? '&' : '?'}s=${size * 2}`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      style={style}
      className={cn('shrink-0 rounded-full bg-[#ffe9cc] ring-2 ring-white', className)}
    />
  )
}

export function SectionIcon({ section, size = 40 }: { section: ForumSection; size?: number }) {
  const Icon = section.icon
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${section.from}, ${section.to})` }}
    >
      <Icon style={{ width: size * 0.48, height: size * 0.48, color: section.ink }} />
    </span>
  )
}

export function SectionChip({ section }: { section: ForumSection }) {
  return (
    <span className="forum-chip" style={{ background: section.from, color: section.ink }}>
      <section.icon className="w-3 h-3" />
      {section.title}
    </span>
  )
}

export function TopicSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Загружаем беседы" className="forum-card overflow-hidden">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="forum-row flex items-start gap-4 p-4 md:p-5">
          <div className="forum-shimmer w-10 h-10 !rounded-full shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="forum-shimmer h-4 w-2/3" />
            <div className="forum-shimmer h-3 w-full" />
            <div className="forum-shimmer h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="forum-card p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <AlertCircle className="w-6 h-6 text-[color:var(--f-rust)] shrink-0" />
      <div className="flex-1">
        <div className="font-bold">Не удалось загрузить беседы</div>
        <div className="text-sm text-[color:var(--f-ink-soft)] break-words">{message}</div>
      </div>
      <button onClick={onRetry} className="solar-btn solar-btn--soft-light">
        <RefreshCw className="w-4 h-4" />
        Повторить
      </button>
    </div>
  )
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="forum-card px-6 py-12 text-center flex flex-col items-center">
      <span aria-hidden className="mb-4 w-14 h-14 rounded-full bg-[radial-gradient(circle_at_40%_35%,#fff8e6,#ffd27a_50%,#ff9f6b)] shadow-[0_0_30px_8px_rgba(255,190,110,0.45)]" />
      <div className="solar-display text-lg font-bold mb-1">{title}</div>
      <p className="text-sm text-[color:var(--f-ink-soft)] max-w-sm mb-5">{text}</p>
      {action}
    </div>
  )
}
