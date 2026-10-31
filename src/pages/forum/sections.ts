// Structure of «Круг Солара»: sections, the rules, and how GitHub titles map onto sections.
// Topics opened on the site are titled "[Тег] Заголовок" — the tag places them in a section,
// so the whole forum lives in one GitHub category and new sections need no GitHub setup.
import {
  BookOpen,
  Clapperboard,
  Flame,
  Gamepad2,
  HeartHandshake,
  LifeBuoy,
  Lightbulb,
  Megaphone,
  Sprout,
  type LucideIcon,
} from 'lucide-react'

export interface ForumSection {
  id: string
  /** Short tag written into the GitHub title, e.g. "[Книги] …". */
  tag: string
  title: string
  description: string
  icon: LucideIcon
  /** Accent pair: icon disk gradient from → to, and a readable ink color for chips. */
  from: string
  to: string
  ink: string
  /** Only the team posts here (GitHub "Announcements"). */
  readOnly?: boolean
  /** Starter prompts shown in the "new topic" form. */
  prompts: string[]
}

export const SECTIONS: ForumSection[] = [
  {
    id: 'news',
    tag: 'Вести',
    title: 'Вести Солара',
    description: 'Новости проекта и объявления команды',
    icon: Megaphone,
    from: '#fff1c9',
    to: '#ffc97a',
    ink: '#9a5a14',
    readOnly: true,
    prompts: [],
  },
  {
    id: 'ochag',
    tag: 'Очаг',
    title: 'Очаг',
    description: 'Знакомство и тёплые беседы обо всём',
    icon: Flame,
    from: '#ffe2c4',
    to: '#ffad7a',
    ink: '#a2481c',
    prompts: ['Расскажите о себе', 'Что вас сегодня порадовало?', 'Как вы нашли Солар?'],
  },
  {
    id: 'videos',
    tag: 'Ролики',
    title: 'Ролики',
    description: 'Обсуждаем мультфильмы и видео Солара',
    icon: Clapperboard,
    from: '#ffe0dc',
    to: '#ff9f8f',
    ink: '#a23a2c',
    prompts: ['Какой ролик запомнился и почему?', 'Предложите тему для нового ролика'],
  },
  {
    id: 'books',
    tag: 'Книги',
    title: 'Книги и саммари',
    description: 'Мысли о прочитанном, советы, что почитать',
    icon: BookOpen,
    from: '#e6f0ff',
    to: '#9cc4f2',
    ink: '#2c5a8f',
    prompts: ['Книга, которая изменила мой взгляд', 'Посоветуйте книгу о…'],
  },
  {
    id: 'games',
    tag: 'Игры',
    title: 'Сказки и игры',
    description: 'Сказочные игры, их герои и смыслы',
    icon: Gamepad2,
    from: '#dff7ee',
    to: '#8fe3c8',
    ink: '#1f6b55',
    prompts: ['Чему учит сказка о…', 'Как прошли игру вместе с ребёнком'],
  },
  {
    id: 'path',
    tag: 'Путь',
    title: 'Путь к себе',
    description: 'Саморазвитие, практики, вопросы о смысле',
    icon: Sprout,
    from: '#eef7d9',
    to: '#bfe08a',
    ink: '#4b6a1c',
    prompts: ['Моя утренняя практика', 'Как сохранить свет в трудный день'],
  },
  {
    id: 'family',
    tag: 'Семья',
    title: 'Семья и дети',
    description: 'Растить с добром, учиться вместе',
    icon: HeartHandshake,
    from: '#ffe6f0',
    to: '#f7a8c6',
    ink: '#9b2f5c',
    prompts: ['Как мы смотрим ролики с детьми', 'Добрые традиции нашей семьи'],
  },
  {
    id: 'ideas',
    tag: 'Идеи',
    title: 'Идеи для Солара',
    description: 'Что сделать дальше — предложения и мечты',
    icon: Lightbulb,
    from: '#f0e8ff',
    to: '#c4a8f0',
    ink: '#5b3f99',
    prompts: ['Хочу, чтобы на Соларе появилось…', 'Идея для новой сказочной игры'],
  },
  {
    id: 'help',
    tag: 'Помощь',
    title: 'Вопросы и помощь',
    description: 'Если что-то не работает или непонятно',
    icon: LifeBuoy,
    from: '#e9eef5',
    to: '#b6c3d6',
    ink: '#3d4b63',
    prompts: ['Не открывается игра', 'Как поддержать проект?'],
  },
]

export const WRITABLE_SECTIONS = SECTIONS.filter((s) => !s.readOnly)
export const DEFAULT_SECTION = SECTIONS[1]!

export const sectionById = (id: string | undefined) => SECTIONS.find((s) => s.id === id)

/** GitHub category slugs that map to a section without a title tag. */
const CATEGORY_SECTION: Record<string, string> = { announcements: 'news', ideas: 'ideas', 'q-a': 'help' }

/** Splits "[Книги] Заголовок" into its section and the clean title. */
export function placeTopic(rawTitle: string, category: string): { section: ForumSection; title: string } {
  const m = /^\s*\[([^\]]{1,40})\]\s*(.+)$/.exec(rawTitle)
  if (m) {
    const tag = m[1]!.trim().toLowerCase()
    const hit = SECTIONS.find((s) => s.tag.toLowerCase() === tag || s.title.toLowerCase() === tag || s.id === tag)
    if (hit) return { section: hit, title: m[2]!.trim() }
  }
  const byCategory = sectionById(CATEGORY_SECTION[category])
  return { section: byCategory ?? DEFAULT_SECTION, title: rawTitle.trim() }
}

export const titleTerm = (section: ForumSection, title: string) => `[${section.tag}] ${title.trim()}`

export const RULES = [
  { title: 'Говорим с добром', text: 'Спорим об идеях, а не с людьми.' },
  { title: 'Делимся светом', text: 'Полезным, проверенным, своим.' },
  { title: 'Без вражды', text: 'Без политики, ссор и рекламы.' },
  { title: 'Бережём детей', text: 'Всё, что пишем, может прочитать ребёнок.' },
  { title: 'Благодарим', text: 'Спасибо — это тоже свет.' },
]
