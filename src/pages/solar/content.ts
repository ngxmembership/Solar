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
    id: 'memory',
    title: 'Как работает память',
    duration: '8:30',
    tag: 'Нейронаука',
    description: 'Кратковременная и долговременная память, сон и интервальные повторения.',
    gradient: 'from-violet-400 to-fuchsia-500',
  },
  {
    id: 'habits',
    title: 'Привычки за 7 минут',
    duration: '7:00',
    tag: 'Психология',
    description: 'Петля «сигнал — действие — награда» и как встроить новую привычку в день.',
    gradient: 'from-rose-300 to-orange-400',
  },
  {
    id: 'eq',
    title: 'Эмоциональный интеллект',
    duration: '9:15',
    tag: 'Отношения',
    description: 'Как замечать свои эмоции, понимать чужие и спокойно говорить о сложном.',
    gradient: 'from-pink-300 to-purple-500',
  },
  {
    id: 'money',
    title: 'Финансовая грамотность: старт',
    duration: '10:40',
    tag: 'Деньги',
    description: 'Подушка безопасности, бюджет без стресса и сложный процент простыми словами.',
    gradient: 'from-yellow-300 to-emerald-500',
  },
]

export const BOOKS: Book[] = [
  {
    id: 'atomic-habits',
    title: 'Атомные привычки',
    author: 'Джеймс Клир',
    minutes: 12,
    cover: 'from-amber-200 via-orange-300 to-rose-400',
    ideas: [
      'Маленькие улучшения на 1% в день со временем складываются в огромный результат.',
      'Меняйте систему, а не только цели: результат следует за процессом.',
      'Четыре закона: сделайте привычку очевидной, привлекательной, простой и приносящей удовольствие.',
    ],
  },
  {
    id: 'mindset',
    title: 'Гибкое сознание',
    author: 'Кэрол Дуэк',
    minutes: 10,
    cover: 'from-emerald-200 via-teal-300 to-sky-400',
    ideas: [
      'Установка на рост: способности развиваются через усилия и практику.',
      'Ошибка — это информация для следующего шага, а не приговор.',
      'Хвалите за усилия и стратегию, а не за «врождённый талант».',
    ],
  },
  {
    id: 'flow',
    title: 'Поток',
    author: 'Михай Чиксентмихайи',
    minutes: 11,
    cover: 'from-sky-200 via-indigo-300 to-violet-400',
    ideas: [
      'Поток — состояние полной вовлечённости, когда время будто исчезает.',
      'Он возникает, когда сложность задачи чуть выше текущего навыка.',
      'Ясные цели и быстрая обратная связь помогают войти в поток.',
    ],
  },
  {
    id: 'thinking',
    title: 'Думай медленно… решай быстро',
    author: 'Даниэль Канеман',
    minutes: 14,
    cover: 'from-rose-200 via-fuchsia-300 to-purple-400',
    ideas: [
      'Система 1 — быстрая и интуитивная, Система 2 — медленная и рассудочная.',
      'Интуиция подвержена искажениям: эффекту якоря, доступности, излишней уверенности.',
      'Перед важным решением полезно замедлиться и проверить исходные данные.',
    ],
  },
]

// Built-in games, shown until public/games/games.json lists real ones.
export const GAMES: Game[] = [
  {
    id: 'memory',
    title: 'Память Солара',
    description: 'Найди все пары светлых символов за наименьшее число ходов.',
    color: '#8fe3c8',
    playable: true,
  },
  {
    id: 'star-math',
    title: 'Звёздная математика',
    description: 'Собирай созвездия, решая примеры на скорость.',
    color: '#ff8f7a',
    playable: false,
  },
  {
    id: 'fireflies',
    title: 'Слова-светлячки',
    description: 'Лови буквы-светлячков и складывай из них слова.',
    color: '#8cc8f0',
    playable: false,
  },
  {
    id: 'habit-maze',
    title: 'Лабиринт привычек',
    description: 'Проведи героя к цели, выбирая полезные привычки.',
    color: '#c4a8f0',
    playable: false,
  },
]
