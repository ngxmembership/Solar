// One conversation: the opening post and the live thread (replies, reactions, sign-in via GitHub).
import { useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { CalendarDays, ChevronRight, ExternalLink, MessageCircle } from 'lucide-react'
import { FORUM_GITHUB_URL } from './config'
import { fullDate, plural } from './model'
import { DEFAULT_SECTION, sectionById } from './sections'
import { useForum } from './useForum'
import { Avatar, SectionChip, SectionIcon } from './ui/bits'
import { ForumShell } from './ui/ForumShell'
import { GiscusThread } from './ui/GiscusThread'
import { TopicRow } from './ui/TopicList'

export default function ForumTopicPage() {
  const params = useParams()
  const n = Number(params['number'])
  const valid = Number.isInteger(n) && n > 0
  const { state } = useLocation() as { state: { title?: string; sectionId?: string } | null }
  const { topics, loading } = useForum()

  const topic = useMemo(() => topics.find((t) => t.number === n) ?? null, [topics, n])
  // A brand-new topic isn't in the list yet (it refreshes within a minute) — use what we know.
  const section = topic?.section ?? sectionById(state?.sectionId) ?? DEFAULT_SECTION
  const title = topic?.title ?? state?.title ?? (loading ? '' : `Беседа №${n}`)
  const related = useMemo(
    () => topics.filter((t) => t.section.id === section.id && t.number !== n).slice(0, 4),
    [topics, section, n],
  )

  if (!valid) {
    return (
      <ForumShell>
        <p className="text-center text-[color:var(--f-ink-soft)] py-20">
          Беседа не найдена. <Link to="/forum" className="underline">Вернуться в Круг</Link>
        </p>
      </ForumShell>
    )
  }

  return (
    <ForumShell>
      <nav aria-label="Навигация" className="flex items-center gap-1.5 text-sm text-[color:var(--f-ink-faint)] mb-5 min-w-0">
        <Link to="/forum" className="hover:text-[color:var(--f-ink)] transition-colors shrink-0">
          Круг Солара
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link to={`/forum/s/${section.id}`} className="hover:text-[color:var(--f-ink)] transition-colors truncate">
          {section.title}
        </Link>
      </nav>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <article className="min-w-0">
          <header className="forum-card forum-rise p-5 md:p-8 mb-4">
            <div className="mb-3">
              <SectionChip section={section} />
            </div>
            {title ? (
              <h1 className="solar-display text-2xl md:text-[34px] font-bold leading-tight mb-4 break-words">{title}</h1>
            ) : (
              <div className="forum-shimmer h-9 w-2/3 mb-4" />
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[color:var(--f-ink-soft)]">
              {topic?.author && (
                <a href={topic.author.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold hover:text-[color:var(--f-ink)]">
                  <Avatar person={topic.author} size={28} />
                  {topic.author.login}
                </a>
              )}
              {topic && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    {fullDate(topic.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    {plural(topic.replies, ['ответ', 'ответа', 'ответов'])}
                  </span>
                </>
              )}
              <a
                href={topic?.url ?? `${FORUM_GITHUB_URL}/${n}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 ml-auto text-xs text-[color:var(--f-ink-faint)] hover:text-[color:var(--f-ink)]"
              >
                На GitHub
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            {topic?.bodyHTML && (
              // Opening post HTML comes from GitHub, which sanitizes it.
              <div className="forum-prose mt-6 pt-6 border-t border-[color:var(--f-line)]" dangerouslySetInnerHTML={{ __html: topic.bodyHTML }} />
            )}
          </header>

          <section aria-label="Ответы" className="forum-card p-3 md:p-5">
            <GiscusThread target={{ number: n }} />
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 grid gap-3">
          <Link to={`/forum/s/${section.id}`} className="forum-card forum-card--link p-5 flex items-center gap-3">
            <SectionIcon section={section} size={44} />
            <div className="min-w-0">
              <div className="font-bold">{section.title}</div>
              <div className="text-sm text-[color:var(--f-ink-soft)] leading-snug">{section.description}</div>
            </div>
          </Link>
          {related.length > 0 && (
            <div className="forum-card overflow-hidden">
              <div className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--f-gold)]">Ещё в разделе</div>
              {related.map((t) => (
                <TopicRow key={t.number} topic={t} showSection={false} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </ForumShell>
  )
}
