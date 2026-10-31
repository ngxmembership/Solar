// Start a conversation: pick a section and a title, then write the opening message right here.
// The topic is created on GitHub the moment the first message is sent, and we move to its page.
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronRight, PenLine, Sparkles } from 'lucide-react'
import { Input } from '../../lib/shadcn/input'
import { cn } from '../../lib/shadcn/utils'
import { DEFAULT_SECTION, sectionById, titleTerm, WRITABLE_SECTIONS } from './sections'
import { SectionChip, SectionIcon } from './ui/bits'
import { RulesCard } from './ui/Blocks'
import { ForumShell } from './ui/ForumShell'
import { GiscusThread, type DiscussionInfo } from './ui/GiscusThread'

const MAX_TITLE = 100

export default function ForumNewTopicPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const fromUrl = sectionById(params.get('s') ?? undefined)
  const section = fromUrl && !fromUrl.readOnly ? fromUrl : DEFAULT_SECTION
  const committedTitle = (params.get('t') ?? '').trim().slice(0, MAX_TITLE)

  const [draftSection, setDraftSection] = useState(section.id)
  const [draftTitle, setDraftTitle] = useState(committedTitle)
  const chosen = sectionById(draftSection) ?? DEFAULT_SECTION
  const ready = draftTitle.trim().length >= 4

  const proceed = () => {
    if (!ready) return
    setParams({ s: chosen.id, t: draftTitle.trim() })
  }

  const onDiscussion = (info: DiscussionInfo) => {
    if (info.number && info.comments > 0) {
      navigate(`/forum/t/${info.number}`, { replace: true, state: { title: committedTitle, sectionId: section.id } })
    }
  }

  return (
    <ForumShell>
      <nav aria-label="Навигация" className="flex items-center gap-1.5 text-sm text-[color:var(--f-ink-faint)] mb-5">
        <Link to="/forum" className="hover:text-[color:var(--f-ink)] transition-colors">
          Круг Солара
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[color:var(--f-ink-soft)] font-semibold">Новая беседа</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        {!committedTitle ? (
          // Step 1 — section and title
          <form
            className="forum-card forum-rise p-5 md:p-8"
            onSubmit={(e) => {
              e.preventDefault()
              proceed()
            }}
          >
            <div className="solar-eyebrow solar-eyebrow--light mb-2">Шаг 1 из 2</div>
            <h1 className="solar-display text-2xl md:text-4xl font-bold mb-6">О чём поговорим?</h1>

            <fieldset className="mb-6">
              <legend className="text-sm font-bold mb-3">Раздел</legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WRITABLE_SECTIONS.map((s) => (
                  <label
                    key={s.id}
                    className={cn(
                      'cursor-pointer rounded-2xl border p-3 flex flex-col gap-2 transition-colors',
                      draftSection === s.id
                        ? 'border-[#e08a2e] bg-[#fff4e2] shadow-[0_8px_20px_-12px_rgba(224,138,46,0.7)]'
                        : 'border-[color:var(--f-line)] bg-white/70 hover:bg-white',
                    )}
                  >
                    <input type="radio" name="section" value={s.id} checked={draftSection === s.id} onChange={() => setDraftSection(s.id)} className="sr-only" />
                    <SectionIcon section={s} size={32} />
                    <span className="text-sm font-bold leading-tight">{s.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label htmlFor="topic-title" className="block text-sm font-bold mb-2">
              Заголовок
            </label>
            <Input
              id="topic-title"
              value={draftTitle}
              maxLength={MAX_TITLE}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Например: Какая сказка нравится вашим детям?"
              className="h-12 rounded-2xl !px-4 bg-white border-[color:var(--f-line)] text-[color:var(--f-ink)] text-base placeholder:text-[color:var(--f-ink-faint)] focus-visible:ring-[#e08a2e]/50 focus-visible:ring-offset-0"
            />
            <div className="flex justify-between mt-2 text-xs text-[color:var(--f-ink-faint)]">
              <span>Коротко и по сути — так беседу легче найти</span>
              <span>
                {draftTitle.length}/{MAX_TITLE}
              </span>
            </div>

            {chosen.prompts.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Sparkles className="w-4 h-4 text-[color:var(--f-gold)]" />
                {chosen.prompts.map((p) => (
                  <button key={p} type="button" onClick={() => setDraftTitle(p)} className="forum-filter !py-1.5 !text-xs">
                    {p}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 flex items-center justify-end">
              <button type="submit" disabled={!ready} className="solar-btn solar-btn--ink !px-6 !py-3 disabled:opacity-40 disabled:pointer-events-none">
                Дальше
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          // Step 2 — the opening message, written in the live thread
          <div className="forum-rise">
            <div className="forum-card p-5 md:p-8 mb-4">
              <div className="solar-eyebrow solar-eyebrow--light mb-3">Шаг 2 из 2</div>
              <div className="mb-3">
                <SectionChip section={section} />
              </div>
              <h1 className="solar-display text-2xl md:text-[34px] font-bold leading-tight mb-3 break-words">{committedTitle}</h1>
              <p className="text-sm text-[color:var(--f-ink-soft)] flex items-start gap-2">
                <PenLine className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--f-gold)]" />
                Войдите через GitHub и напишите первое сообщение — с ним беседа появится в Круге.
              </p>
              <button
                onClick={() => {
                  setDraftSection(section.id)
                  setDraftTitle(committedTitle)
                  setParams({ s: section.id })
                }}
                className="mt-3 text-xs font-semibold text-[color:var(--f-rust)] underline underline-offset-4"
              >
                Изменить раздел или заголовок
              </button>
            </div>
            <section aria-label="Первое сообщение" className="forum-card p-3 md:p-5">
              <GiscusThread target={{ term: titleTerm(section, committedTitle) }} inputPosition="top" onDiscussion={onDiscussion} />
            </section>
          </div>
        )}

        <aside className="lg:sticky lg:top-24">
          <RulesCard compact />
        </aside>
      </div>
    </ForumShell>
  )
}
