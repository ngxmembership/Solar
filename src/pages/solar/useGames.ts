// Games come from public/games/games.json, so new games are added without touching code.
// Until that file lists any, the built-in games are shown. "Память Солара" is always kept.
import { useEffect, useState } from 'react'
import { GAMES, type Game } from './content'

interface ManifestEntry {
  id?: string
  title?: string
  description?: string
  color?: string
  folder?: string
}

const PALETTE = ['#8fe3c8', '#ff8f7a', '#8cc8f0', '#c4a8f0']

export function useGames(): Game[] {
  const [games, setGames] = useState<Game[]>(GAMES)

  useEffect(() => {
    let cancelled = false
    const base = import.meta.env.BASE_URL || '/'
    fetch(`${base}games/games.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return
        const list: Game[] = (data as ManifestEntry[])
          .filter((g) => g && g.id && g.title && g.folder)
          .map((g, i) => ({
            id: g.id!,
            title: g.title!,
            description: g.description ?? '',
            color: g.color ?? PALETTE[i % PALETTE.length]!,
            playable: true,
            url: `${base}games/${g.folder}/`,
          }))
        if (list.length === 0) return
        const memory = GAMES.find((g) => g.id === 'memory')
        setGames(memory ? [...list, memory] : list)
      })
      .catch(() => {
        /* no manifest yet — keep built-in games */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return games
}
