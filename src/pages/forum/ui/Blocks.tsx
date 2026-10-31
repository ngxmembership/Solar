// Section tiles, the rules of the circle and the "how to join" steps.
import { Link } from 'react-router-dom'
import { LogIn, MessagesSquare, PenLine } from 'lucide-react'
import { plural, timeAgo, type ForumTopic } from '../model'
import { RULES, type ForumSection } from '../sections'
import { SectionIcon } from './bits'

export function SectionCard({ section, topics }: { section: ForumSection; topics: ForumTopic[] }) {
  const last = topics.reduce<ForumTopic | null>((a, t) => (!a || t.lastActivityAt > a.lastActivityAt ? t : a), null)
  return (
    <Link to={`/forum/s/${section.id}`} className="forum-card forum-card--link group flex flex-col p-5 min-h-[168px]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <SectionIcon section={section} size={44} />
        <span className="text-xs font-semibold text-[color:var(--f-ink-faint)]">{plural(topics.length, ['беседа', 'беседы', 'бесед'])}</span>
      </div>
      <h3 className="solar-display text-[17px] font-bold leading-tight mb-1 group-hover:text-[color:var(--f-rust)] transition-colors">{section.title}</h3>
      <p className="text-sm text-[color:var(--f-ink-soft)] leading-snug">{section.description}</p>
      <div className="mt-auto pt-3 text-xs text-[color:var(--f-ink-faint)] truncate">
        {last ? (
          <>
            Недавно: <span className="text-[color:var(--f-ink-soft)] font-semibold">{last.title}</span> · {timeAgo(last.lastActivityAt)}
          </>
        ) : (
          'Ждёт первой беседы'
        )}
      </div>
    </Link>
  )
}

export function RulesCard({ compact = false }: { compact?: boolean }) {
  return (
    <section id="rules" aria-labelledby="rules-title" className="forum-card p-5 md:p-7 scroll-mt-24">
      <div className="solar-eyebrow solar-eyebrow--light mb-2">Устав Круга</div>
      <h2 id="rules-title" className="solar-display text-xl md:text-2xl font-bold mb-4">
        Пять простых правил
      </h2>
      <ol className={compact ? 'grid gap-3' : 'grid sm:grid-cols-2 lg:grid-cols-5 gap-3'}>
        {RULES.map((r, i) => (
          <li key={r.title} className="rounded-2xl bg-[#fff6ea] border border-[color:var(--f-line)] p-4">
            <span className="solar-display text-xs font-bold text-[color:var(--f-gold)]">0{i + 1}</span>
            <div className="font-bold mt-1">{r.title}</div>
            <div className="text-sm text-[color:var(--f-ink-soft)] leading-snug">{r.text}</div>
          </li>
        ))}
      </ol>
    </section>
  )
}

const STEPS = [
  { icon: LogIn, title: 'Войдите через GitHub', text: 'Бесплатно, за минуту. Читать можно и без входа.' },
  { icon: MessagesSquare, title: 'Выберите раздел', text: 'Или присоединитесь к беседе, которая уже идёт.' },
  { icon: PenLine, title: 'Напишите с добром', text: 'Вопрос, мысль, благодарность — всё это свет.' },
]

export function JoinSteps() {
  return (
    <section aria-label="Как присоединиться" className="grid md:grid-cols-3 gap-3">
      {STEPS.map((s, i) => (
        <div key={s.title} className="forum-card p-5 flex items-start gap-4">
          <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fff1c9] to-[#ffd27a]">
            <s.icon className="w-[18px] h-[18px] text-[color:var(--f-rust)]" />
          </span>
          <div>
            <div className="text-xs font-bold text-[color:var(--f-gold)] mb-0.5">Шаг {i + 1}</div>
            <div className="font-bold">{s.title}</div>
            <div className="text-sm text-[color:var(--f-ink-soft)] leading-snug">{s.text}</div>
          </div>
        </div>
      ))}
    </section>
  )
}
