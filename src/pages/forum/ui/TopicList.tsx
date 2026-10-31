// Topic list with search, sort and (optionally) section filters.
import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Search, X } from 'lucide-react'
import { Input } from '../../../lib/shadcn/input'
import { cn } from '../../../lib/shadcn/utils'
import { plural, timeAgo, type ForumTopic } from '../model'
import { SECTIONS } from '../sections'
import { Avatar, EmptyState, SectionChip } from './bits'

type Sort = 'active' | 'new' | 'hot'
const SORTS: { id: Sort; label: string }[] = [
  { id: 'active', label: 'Активные' },
  { id: 'new', label: 'Новые' },
  { id: 'hot', label: 'Обсуждаемые' },
]
const PAGE = 20

export function TopicRow({ topic, showSection = true }: { topic: ForumTopic; showSection?: boolean }) {
  return (
    <Link to={`/forum/t/${topic.number}`} className="forum-row group flex items-start gap-3.5 md:gap-4 p-4 md:p-5">
      <Avatar person={topic.author} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
          {showSection && <SectionChip section={topic.section} />}
          <span className="text-xs text-[color:var(--f-ink-faint)]">
            {topic.author?.login ?? 'Гость'} · {timeAgo(topic.createdAt)}
          </span>
        </div>
        <h3 className="font-bold text-[15px] md:text-base leading-snug group-hover:text-[color:var(--f-rust)] transition-colors">
          {topic.title}
        </h3>
        {topic.excerpt && <p className="mt-1 text-sm text-[color:var(--f-ink-soft)] line-clamp-2">{topic.excerpt}</p>}
      </div>
      <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 text-xs text-[color:var(--f-ink-faint)] pl-2">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--f-ink-soft)]">
          <MessageCircle className="w-3.5 h-3.5" />
          {topic.replies}
        </span>
        {topic.reactions > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            {topic.reactions}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          {topic.lastAuthor && topic.replies > 0 && <Avatar person={topic.lastAuthor} size={18} className="!ring-1" />}
          {timeAgo(topic.lastActivityAt)}
        </span>
      </div>
      <span className="sm:hidden self-center inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--f-ink-soft)]">
        <MessageCircle className="w-3.5 h-3.5" />
        {topic.replies}
      </span>
    </Link>
  )
}

export function TopicList({
  topics,
  sectionFilter = false,
  emptyAction,
}: {
  topics: ForumTopic[]
  /** Show section chips (forum home). */
  sectionFilter?: boolean
  emptyAction?: ReactNode
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('active')
  const [section, setSection] = useState<string | null>(null)
  const [limit, setLimit] = useState(PAGE)
  const q = useDeferredValue(query.trim().toLowerCase())

  const visible = useMemo(() => {
    const list = topics.filter(
      (t) =>
        (!section || t.section.id === section) &&
        (!q || t.title.toLowerCase().includes(q) || t.excerpt.toLowerCase().includes(q) || (t.author?.login.toLowerCase().includes(q) ?? false)),
    )
    const by: Record<Sort, (a: ForumTopic, b: ForumTopic) => number> = {
      active: (a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt),
      new: (a, b) => b.createdAt.localeCompare(a.createdAt),
      hot: (a, b) => b.replies + b.reactions - (a.replies + a.reactions) || b.lastActivityAt.localeCompare(a.lastActivityAt),
    }
    return list.sort(by[sort])
  }, [topics, section, q, sort])

  const sectionsWithTopics = useMemo(() => SECTIONS.filter((s) => topics.some((t) => t.section.id === s.id)), [topics])

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
        <div className="relative flex-1">
          <Search aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--f-ink-faint)]" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setLimit(PAGE)
            }}
            placeholder="Поиск по беседам"
            aria-label="Поиск по беседам"
            className="h-11 rounded-full !pl-10 !pr-10 bg-white/85 border-[color:var(--f-line)] text-[color:var(--f-ink)] placeholder:text-[color:var(--f-ink-faint)] focus-visible:ring-[#e08a2e]/50 focus-visible:ring-offset-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Очистить поиск"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[color:var(--f-ink-faint)] hover:text-[color:var(--f-ink)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div role="group" aria-label="Порядок" className="flex gap-1.5 overflow-x-auto">
          {SORTS.map((s) => (
            <button key={s.id} aria-pressed={sort === s.id} onClick={() => setSort(s.id)} className="forum-filter">
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {sectionFilter && sectionsWithTopics.length > 1 && (
        <div role="group" aria-label="Разделы" className="flex gap-1.5 overflow-x-auto pb-1 mb-3 solar-scroller md:flex-wrap">
          <button aria-pressed={section === null} onClick={() => setSection(null)} className="forum-filter">
            Все разделы
          </button>
          {sectionsWithTopics.map((s) => (
            <button key={s.id} aria-pressed={section === s.id} onClick={() => setSection(section === s.id ? null : s.id)} className="forum-filter">
              {s.title}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        q ? (
          <EmptyState title="Ничего не нашлось" text="Попробуйте другое слово — или начните беседу на эту тему сами." action={emptyAction} />
        ) : (
          <EmptyState title="Здесь пока тихо" text="Зажгите первую беседу — с неё начнётся этот круг." action={emptyAction} />
        )
      ) : (
        <>
          <div className="forum-card overflow-hidden">
            {visible.slice(0, limit).map((t) => (
              <TopicRow key={t.number} topic={t} showSection={sectionFilter} />
            ))}
          </div>
          <div className={cn('mt-4 flex items-center justify-between text-xs text-[color:var(--f-ink-faint)]')}>
            <span>{plural(visible.length, ['беседа', 'беседы', 'бесед'])}</span>
            {visible.length > limit && (
              <button onClick={() => setLimit((l) => l + PAGE)} className="solar-btn solar-btn--soft-light !py-2">
                Показать ещё
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
