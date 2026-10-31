// «Круг Солара» — forum home: welcome, news from the team, sections, fresh conversations, rules.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Megaphone, PenLine } from 'lucide-react'
import { plural, timeAgo } from './model'
import { WRITABLE_SECTIONS } from './sections'
import { useForum } from './useForum'
import { ErrorState, TopicSkeleton } from './ui/bits'
import { JoinSteps, RulesCard, SectionCard } from './ui/Blocks'
import { Emblem } from './ui/Emblem'
import { ForumShell } from './ui/ForumShell'
import { TopicList } from './ui/TopicList'

export default function ForumHome() {
  const { topics, loading, error, refresh } = useForum()

  const news = useMemo(() => topics.filter((t) => t.section.id === 'news').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 2), [topics])
  const conversations = useMemo(() => topics.filter((t) => t.section.id !== 'news'), [topics])
  const stats = useMemo(() => {
    const people = new Set(topics.flatMap((t) => t.people))
    return {
      topics: conversations.length,
      replies: topics.reduce((n, t) => n + t.replies, 0),
      people: people.size,
    }
  }, [topics, conversations])

  return (
    <ForumShell>
      {/* Welcome */}
      <section className="grid md:grid-cols-[1.25fr_1fr] gap-8 md:gap-12 items-center mb-10 md:mb-14">
        <div className="forum-rise">
          <div className="solar-eyebrow solar-eyebrow--light mb-3">Форум Солара</div>
          <h1 className="solar-display text-[40px] md:text-[64px] font-bold leading-[1.02] mb-4">
            <span className="solar-dawn-text">Круг Солара</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-[color:var(--f-ink-soft)] max-w-xl mb-6">
            Место, где делятся светом: обсуждают ролики и книги, проходят сказки вместе с детьми, задают вопросы и
            поддерживают друг друга на пути к себе.
          </p>
          <div className="flex flex-wrap gap-2.5 mb-7">
            <Link to="/forum/new" className="solar-btn solar-btn--sun !px-5 !py-3">
              <PenLine className="w-4 h-4" />
              Начать беседу
            </Link>
            <button
              onClick={() => document.getElementById('rules')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="solar-btn solar-btn--soft-light !px-5 !py-3"
            >
              Устав Круга
            </button>
          </div>
          <dl className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              { v: stats.topics, l: ['беседа', 'беседы', 'бесед'] as [string, string, string] },
              { v: stats.replies, l: ['ответ', 'ответа', 'ответов'] as [string, string, string] },
              { v: stats.people, l: ['участник', 'участника', 'участников'] as [string, string, string] },
            ].map((s) => {
              const [num, ...word] = plural(s.v, s.l).split(' ')
              return (
                <div key={s.l[0]}>
                  <dt className="sr-only">{word.join(' ')}</dt>
                  <dd className="flex items-baseline gap-1.5">
                    <span className="solar-display text-2xl font-bold">{loading ? '·' : num}</span>
                    <span className="text-sm text-[color:var(--f-ink-soft)]">{word.join(' ')}</span>
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
        <div className="hidden md:block forum-rise" style={{ animationDelay: '0.15s' }}>
          <Emblem />
        </div>
      </section>

      {/* News from the team */}
      {news.length > 0 && (
        <section aria-label="Вести Солара" className="mb-10 grid gap-3">
          {news.map((t) => (
            <Link
              key={t.number}
              to={`/forum/t/${t.number}`}
              className="forum-card forum-card--link group flex items-center gap-4 p-4 md:p-5 bg-gradient-to-r from-[#fff4d6] to-white/80"
            >
              <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fff1c9] to-[#ffc97a] shadow-[0_0_24px_4px_rgba(255,190,110,0.45)]">
                <Megaphone className="w-5 h-5 text-[#9a5a14]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--f-gold)] mb-0.5">
                  Вести Солара · {timeAgo(t.createdAt)}
                </div>
                <div className="font-bold truncate group-hover:text-[color:var(--f-rust)] transition-colors">{t.title}</div>
              </div>
              <ArrowRight className="w-5 h-5 shrink-0 text-[color:var(--f-ink-faint)] group-hover:text-[color:var(--f-rust)] group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </section>
      )}

      {/* Sections */}
      <section id="sections" aria-labelledby="sections-title" className="mb-12 scroll-mt-24">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <div className="solar-eyebrow solar-eyebrow--light mb-1.5">Разделы</div>
            <h2 id="sections-title" className="solar-display text-2xl md:text-3xl font-bold">
              О чём говорим
            </h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WRITABLE_SECTIONS.map((s) => (
            <SectionCard key={s.id} section={s} topics={topics.filter((t) => t.section.id === s.id)} />
          ))}
        </div>
      </section>

      {/* Fresh conversations */}
      <section aria-labelledby="fresh-title" className="mb-12">
        <div className="solar-eyebrow solar-eyebrow--light mb-1.5">Свежее</div>
        <h2 id="fresh-title" className="solar-display text-2xl md:text-3xl font-bold mb-4">
          Беседы
        </h2>
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : loading ? (
          <TopicSkeleton />
        ) : (
          <TopicList
            topics={conversations}
            sectionFilter
            emptyAction={
              <Link to="/forum/new" className="solar-btn solar-btn--ink">
                <PenLine className="w-4 h-4" />
                Начать беседу
              </Link>
            }
          />
        )}
      </section>

      <div className="grid gap-3">
        <RulesCard />
        <JoinSteps />
      </div>
    </ForumShell>
  )
}
