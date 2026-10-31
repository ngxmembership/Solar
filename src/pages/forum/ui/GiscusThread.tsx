// Live discussion thread (replies, reactions, sign-in with GitHub) rendered by giscus in an iframe.
// We build the iframe ourselves instead of loading giscus' client script: no third-party script on
// the page, and the hash route (#/forum/t/…) survives the GitHub sign-in round trip.
import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Info } from 'lucide-react'
import { FORUM_CATEGORY, FORUM_CATEGORY_ID, FORUM_GITHUB_URL, FORUM_REPO, FORUM_REPO_ID, GISCUS_ORIGIN, GISCUS_THEME_URL } from '../config'

const SESSION_KEY = 'giscus-session'

/** Picks up the session giscus appends after sign-in (?giscus=…), stores it and cleans the URL. */
function readSession(): string {
  const url = new URL(window.location.href)
  const fresh = url.searchParams.get('giscus')
  if (fresh) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(fresh))
    url.searchParams.delete('giscus')
    window.history.replaceState(window.history.state, document.title, url.toString())
    return fresh
  }
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? '""') as string
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return ''
  }
}

export interface DiscussionInfo {
  number: number | null
  comments: number
}

type Target = { number: number } | { term: string }

export function GiscusThread({
  target,
  inputPosition = 'bottom',
  onDiscussion,
}: {
  target: Target
  inputPosition?: 'top' | 'bottom'
  onDiscussion?: (info: DiscussionInfo) => void
}) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [session, setSession] = useState(readSession)
  const [height, setHeight] = useState(0)
  const [problem, setProblem] = useState<string | null>(null)
  const onDiscussionRef = useRef(onDiscussion)
  onDiscussionRef.current = onDiscussion

  const key = 'number' in target ? `n:${target.number}` : `t:${target.term}`

  const src = useMemo(() => {
    const origin = window.location.href
    const params = new URLSearchParams({
      origin,
      session,
      theme: GISCUS_THEME_URL,
      reactionsEnabled: '1',
      emitMetadata: '1',
      inputPosition,
      repo: FORUM_REPO,
      repoId: FORUM_REPO_ID,
      category: FORUM_CATEGORY,
      categoryId: FORUM_CATEGORY_ID,
      strict: '1',
      description: 'Круг Солара — беседы о свете, знаниях и добре',
      backLink: origin,
    })
    if ('number' in target) params.set('number', String(target.number))
    else params.set('term', target.term)
    return `${GISCUS_ORIGIN}/ru/widget?${params.toString()}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, session, inputPosition])

  useEffect(() => {
    setHeight(0)
    setProblem(null)
  }, [src])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Only the giscus frame of this thread may talk to us.
      if (event.source !== frameRef.current?.contentWindow || event.origin !== GISCUS_ORIGIN) return
      const g = (event.data as { giscus?: Record<string, unknown> } | null)?.giscus
      if (!g || typeof g !== 'object') return
      if (typeof g['resizeHeight'] === 'number') setHeight(g['resizeHeight'])
      if (g['signOut']) {
        localStorage.removeItem(SESSION_KEY)
        setSession('')
      }
      const error = typeof g['error'] === 'string' ? g['error'] : ''
      if (error) {
        if (/Bad credentials|Invalid state value|State has expired/i.test(error)) {
          localStorage.removeItem(SESSION_KEY)
          setSession('')
        } else if (/not installed/i.test(error)) {
          setProblem('not-installed')
        }
      }
      const d = g['discussion'] as { url?: string; totalCommentCount?: number } | undefined
      if (d && onDiscussionRef.current) {
        const m = /\/discussions\/(\d+)/.exec(d.url ?? '')
        onDiscussionRef.current({ number: m ? Number(m[1]) : null, comments: d.totalCommentCount ?? 0 })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  if (problem === 'not-installed') {
    return (
      <div className="forum-card p-5 flex items-start gap-3 text-sm">
        <Info className="w-5 h-5 shrink-0 text-[color:var(--f-rust)]" />
        <div>
          <div className="font-bold mb-1">Обсуждения скоро откроются</div>
          <p className="text-[color:var(--f-ink-soft)] mb-3">Мы подключаем ответы прямо на сайте. Пока беседу можно продолжить на GitHub.</p>
          <a href={FORUM_GITHUB_URL} target="_blank" rel="noopener noreferrer" className="solar-btn solar-btn--soft-light !py-2">
            Открыть на GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {height === 0 && (
        <div aria-hidden className="absolute inset-x-0 top-0 space-y-3">
          <div className="forum-shimmer h-28" />
          <div className="forum-shimmer h-16 w-3/4" />
        </div>
      )}
      <iframe
        key={src}
        ref={frameRef}
        src={src}
        title="Обсуждение"
        loading="lazy"
        allow="clipboard-write"
        className="block w-full border-0 bg-transparent transition-opacity duration-500"
        style={{ height: height || 220, opacity: height ? 1 : 0, colorScheme: 'light' }}
      />
    </div>
  )
}
