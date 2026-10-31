// Forum data shapes (mirrors the payload produced from GitHub Discussions) and small formatters.
import { placeTopic, type ForumSection } from './sections'

export interface ForumPerson {
  login: string
  avatar: string
  url: string
}

export interface ForumRawTopic {
  number: number
  rawTitle: string
  category: string
  url: string
  author: ForumPerson | null
  createdAt: string
  lastActivityAt: string
  lastAuthor: ForumPerson | null
  replies: number
  reactions: number
  excerpt: string
  bodyHTML: string
  viaSite: boolean
  people: string[]
}

export interface ForumPayload {
  generatedAt: string
  topics: ForumRawTopic[]
}

export interface ForumTopic extends ForumRawTopic {
  title: string
  section: ForumSection
}

export const placeAll = (raw: ForumRawTopic[]): ForumTopic[] =>
  raw.map((t) => {
    const { section, title } = placeTopic(t.rawTitle, t.category)
    return { ...t, section, title }
  })

// ---------- formatting ----------
const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })
const dtf = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric' })

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.round((new Date(iso).getTime() - now) / 1000)
  const a = Math.abs(s)
  if (a < 45) return 'только что'
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour')
  if (a < 86400 * 7) return rtf.format(Math.round(s / 86400), 'day')
  return dtf.format(new Date(iso))
}

export const fullDate = (iso: string) => dtf.format(new Date(iso))

const pr = new Intl.PluralRules('ru')
/** plural(5, ['ответ', 'ответа', 'ответов']) → "5 ответов" */
export function plural(n: number, [one, few, many]: [string, string, string]) {
  const k = pr.select(n)
  return `${n} ${k === 'one' ? one : k === 'few' ? few : many}`
}
