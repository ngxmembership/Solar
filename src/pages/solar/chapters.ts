// Story chapters: single source of truth for navigation, the chapter rail and section ids.
// `target` = scroll progress to jump to; `from` = progress where the chapter becomes active.

export const CHAPTERS = [
  { id: 'hero', label: 'Пролог', target: 0, from: 0 },
  { id: 'videos', label: 'Ролики', target: 0.21, from: 0.17 },
  { id: 'books', label: 'Книги', target: 0.42, from: 0.37 },
  { id: 'games', label: 'Игры', target: 0.78, from: 0.67 },
  { id: 'mission', label: 'Миссия', target: 1, from: 0.9 },
] as const

export type ChapterId = (typeof CHAPTERS)[number]['id']

export const chapterTarget = (id: ChapterId) => CHAPTERS.find((c) => c.id === id)?.target ?? 0

export function chapterIndexAt(progress: number): number {
  let idx = 0
  CHAPTERS.forEach((c, i) => {
    if (progress >= c.from) idx = i
  })
  return idx
}

/** UI switches to dark ink once the sky has turned light. */
export const LIGHT_FROM = 0.68
