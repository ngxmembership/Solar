// Content for the Solar site: videos, book summaries and browser games.
// Games added to public/games/games.json replace the placeholder games automatically.

/** Payment page (Boosty, CloudTips, YooMoney…). Leave empty until the link is ready. */
export const DONATE_URL: string = ''

export const DONATE_AMOUNTS = [100, 300, 500, 1000] as const

// Gentle retelling of the Solar image: a warm, tender light at the heart of the world, hidden under a shell.
export const SOLAR_LEGEND =
  'По старому преданию, в самом сердце мира живёт Солар — тёплое и нежное светило, не жгучее и не ослепляющее. Его укрыла многослойная скорлупа, и мир будто погрузился в сон. Но свет никуда не исчез: он просыпается каждый раз, когда мы узнаём новое, делимся добром и вспоминаем, кто мы есть.'

/** Prologue shown under the sealed shell — frames scrolling as the visitor's own act of waking the light. */
export const PROLOGUE = [
  'Говорят, в самом сердце мира живёт Солар — тёплое и нежное светило.',
  'Его укрыли многослойной скорлупой, расписанной звёздами и планетами, и мир будто уснул.',
  'Но скорлупа становится тоньше всякий раз, когда мы узнаём новое и делаем добро.',
]

/** The egg image of the world, told as a parable rather than a claim. */
export const WORLD_PARABLE = [
  { part: 'Скорлупа', meaning: 'бережёт мир снаружи' },
  { part: 'Белок', meaning: 'полон жизни — лесов, рек и людей' },
  { part: 'Желток', meaning: 'Солар, тёплое сердце в самой середине' },
  { part: 'Древо Жизни', meaning: 'связь каждого из нас со светом' },
] as const

/** A kind path from knowledge to action. */
export const PRINCIPLES = [
  { title: 'Мысль', text: 'Знание зажигает новую мысль' },
  { title: 'Чувство', text: 'Мысль становится чувством' },
  { title: 'Дело', text: 'Чувство воплощается в доброе дело' },
] as const

export const EPIGRAPH = { question: 'Что делать?', answer: 'Иди домой …и люби свою семью.' } as const

export interface Video {
  id: string
  title: string
  duration: string
  tag: string
  description: string
  gradient: string
  /** Internal route when the video is already playable in the app. */
  route?: string
}

export interface Book {
  id: string
  title: string
  author: string
  minutes: number
  cover: string
  ideas: string[]
}

export interface Game {
  id: string
  title: string
  description: string
  color: string
  playable: boolean
  /** Page of a browser game (from public/games/games.json). */
  url?: string
}

export const KIDS_VIDEOS: Video[] = [
  {
    id: 'bag-parachute',
    title: 'Пакет вместо парашюта',
    duration: '0:30',
    tag: 'Физика',
    description: 'Мини-шортс о сопротивлении воздуха: можно ли спастись с пакетом вместо парашюта.',
    gradient: 'from-sky-400 to-indigo-500',
  },
  {
    id: 'blue-sky',
    title: 'Почему небо голубое?',
    duration: '4:20',
    tag: 'Природа',
    description: 'Как солнечный свет рассеивается в воздухе и почему закаты бывают розовыми.',
    gradient: 'from-cyan-300 to-blue-500',
  },
  {
    id: 'seed',
    title: 'Как растёт семечко',
    duration: '3:45',
    tag: 'Биология',
    description: 'Путешествие от крошечного зёрнышка до высокого подсолнуха, тянущегося к солнцу.',
    gradient: 'from-emerald-300 to-teal-500',
  },
  {
    id: 'sun-night',
    title: 'Куда уходит солнце ночью',
    duration: '5:10',
    tag: 'Космос',
    description: 'Почему Земля вращается, откуда берутся день и ночь и зачем нам часовые пояса.',
    gradient: 'from-amber-300 to-orange-500',
  },
]

export const ADULT_VIDEOS: Video[] = [
  {
    id: 'ilya-muromets',
    title: 'Илья Муромец и Соловей-разбойник',
    description: 'Богатырский путь в 7 уровнях: сила, смекалка и доброе сердце.',
    color: '#ff8f7a',
    playable: true,
    url: 'https://ngxmembership.github.io/Solar/games/ilya-muromets/',
  },
  {
    id: 'dobrynya',
    title: 'Добрыня Никитич и Змей Горыныч',
    description: 'Восемь уровней отваги: помоги Добрыне одолеть Змея.',
    color: '#8fe3c8',
    playable: true,
    url: 'https://ngxmembership.github.io/Solar/games/dobrynya/',
  },
  {
    id: 'sadko',
    title: 'Садко и Морской царь',
    description: 'Морское приключение в 7 уровнях под звуки гуслей.',
    color: '#8cc8f0',
    playable: true,
    url: 'https://ngxmembership.github.io/Solar/games/sadko/',
  },
  {
    id: 'memory',
    title: 'Память Солара',
    description: 'Найди все пары светлых символов за наименьшее число ходов.',
    color: '#c4a8f0',
    playable: true,
  },
]
