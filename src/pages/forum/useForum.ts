// Forum data source on the public site: forum.json, rebuilt from GitHub Discussions by the deploy
// workflow whenever a topic or reply changes (and every 6 hours). One request per minute at most.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { placeAll, type ForumPayload, type ForumTopic } from './model'

export interface ForumState {
  topics: ForumTopic[]
  generatedAt: string | null
  loading: boolean
  error: string | null
  refresh: () => void
}

const SOURCE = `${import.meta.env.BASE_URL}forum/forum.json`
let cache: { at: number; promise: Promise<ForumPayload> } | null = null

function load(force: boolean): Promise<ForumPayload> {
  if (!force && cache && Date.now() - cache.at < 60_000) return cache.promise
  const promise = fetch(`${SOURCE}?t=${Math.floor(Date.now() / 60_000)}`, { cache: 'no-store' }).then((r) => {
    if (!r.ok) throw new Error(`Сервер ответил ${r.status}`)
    return r.json() as Promise<ForumPayload>
  })
  cache = { at: Date.now(), promise }
  promise.catch(() => {
    cache = null
  })
  return promise
}

export function useForum(): ForumState {
  const [payload, setPayload] = useState<ForumPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const run = useCallback((force: boolean) => {
    setLoading(true)
    setError(null)
    load(force).then(
      (p) => {
        setPayload(p)
        setLoading(false)
      },
      (e: unknown) => {
        setError(e instanceof Error ? e.message : String(e))
        setLoading(false)
      },
    )
  }, [])

  useEffect(() => {
    run(false)
  }, [run])

  const topics = useMemo(() => placeAll(payload?.topics ?? []), [payload])
  const refresh = useCallback(() => run(true), [run])

  return { topics, generatedAt: payload?.generatedAt ?? null, loading: loading && !payload, error, refresh }
}
