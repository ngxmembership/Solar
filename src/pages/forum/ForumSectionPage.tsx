// One section of the circle: its description and conversations.
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, PenLine } from 'lucide-react'
import { sectionById } from './sections'
import { useForum } from './useForum'
import { EmptyState, ErrorState, SectionIcon, TopicSkeleton } from './ui/bits'
import { RulesCard } from './ui/Blocks'
import { ForumShell } from './ui/ForumShell'
import { TopicList } from './ui/TopicList'

export default function ForumSectionPage() {
  const { sectionId } = useParams()
  const section = sectionById(sectionId)
  const { topics, loading, error, refresh } = useForum()
  const mine = useMemo(() => topics.filter((t) => t.section.id === section?.id), [topics, section])

  if (!section) {
    return (
      <ForumShell>
        <EmptyState
          title="Такого раздела нет"
          text="Возможно, ссылка устарела. Загляните в список разделов."
          action={
            <Link to="/forum" className="solar-btn solar-btn--ink">
              К разделам
            </Link>
          }
        />
      </ForumShell>
    )
  }

  const newLink = `/forum/new?s=${section.id}`
  const startButton = !section.readOnly && (
    <Link to={newLink} className="solar-btn solar-btn--ink">
      <PenLine className="w-4 h-4" />
      Новая беседа
    </Link>
  )

  return (
    <ForumShell>
      <nav aria-label="Навигация" className="flex items-center gap-1.5 text-sm text-[color:var(--f-ink-faint)] mb-5">
        <Link to="/forum" className="hover:text-[color:var(--f-ink)] transition-colors">
          Круг Солара
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[color:var(--f-ink-soft)] font-semibold">{section.title}</span>
      </nav>

      <header className="forum-card forum-rise p-5 md:p-7 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 md:gap-5">
        <SectionIcon section={section} size={60} />
        <div className="flex-1">
          <h1 className="solar-display text-2xl md:text-4xl font-bold leading-tight">{section.title}</h1>
          <p className="text-[color:var(--f-ink-soft)] mt-1">{section.description}</p>
          {section.readOnly && <p className="text-xs text-[color:var(--f-ink-faint)] mt-2">Здесь пишет команда Солара — отвечать можно в каждой вести.</p>}
        </div>
        {startButton}
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div>
          {error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : loading ? (
            <TopicSkeleton />
          ) : (
            <TopicList topics={mine} emptyAction={startButton || undefined} />
          )}
        </div>
        <aside className="hidden lg:block sticky top-24">
          <RulesCard compact />
        </aside>
      </div>
    </ForumShell>
  )
}
