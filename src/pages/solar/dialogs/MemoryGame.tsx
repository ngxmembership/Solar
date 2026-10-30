// "Память Солара": a small pair-matching game, playable inside a dialog.
import { useEffect, useState } from 'react'
import { Cloud, Heart, Leaf, Moon, RotateCcw, Star, Sun, type LucideIcon } from 'lucide-react'
import { Button } from '../../../lib/shadcn/button'
import { cn } from '../../../lib/shadcn/utils'

const SYMBOLS: { icon: LucideIcon; color: string }[] = [
  { icon: Sun, color: 'text-amber-500' },
  { icon: Moon, color: 'text-indigo-500' },
  { icon: Star, color: 'text-yellow-500' },
  { icon: Cloud, color: 'text-sky-500' },
  { icon: Leaf, color: 'text-emerald-500' },
  { icon: Heart, color: 'text-rose-500' },
]

function shuffledDeck(): number[] {
  const deck = [...SYMBOLS.keys(), ...SYMBOLS.keys()]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = deck[i]!
    deck[i] = deck[j]!
    deck[j] = a
  }
  return deck
}

export function MemoryGame() {
  const [deck, setDeck] = useState<number[]>(shuffledDeck)
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)

  // Resolve a pair of open cards.
  useEffect(() => {
    if (open.length !== 2) return
    const [a, b] = open as [number, number]
    const same = deck[a] === deck[b]
    const timer = window.setTimeout(
      () => {
        if (same) setMatched((m) => new Set([...m, deck[a]!]))
        setOpen([])
      },
      same ? 350 : 800,
    )
    return () => window.clearTimeout(timer)
  }, [open, deck])

  const won = matched.size === SYMBOLS.length

  const flip = (i: number) => {
    if (open.length >= 2 || open.includes(i) || matched.has(deck[i]!)) return
    const next = [...open, i]
    setOpen(next)
    if (next.length === 2) setMoves((m) => m + 1)
  }

  const restart = () => {
    setDeck(shuffledDeck())
    setOpen([])
    setMatched(new Set())
    setMoves(0)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Ходов: <span className="font-semibold text-foreground">{moves}</span>
        </span>
        <span className="text-muted-foreground">
          Пар: <span className="font-semibold text-foreground">{matched.size} / {SYMBOLS.length}</span>
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {deck.map((sym, i) => {
          const isUp = open.includes(i) || matched.has(sym)
          const { icon: Icon, color } = SYMBOLS[sym]!
          return (
            <button
              key={i}
              type="button"
              onClick={() => flip(i)}
              aria-label={isUp ? 'Открытая карточка' : 'Закрытая карточка'}
              className={cn(
                'aspect-square rounded-xl border flex items-center justify-center transition-all duration-300',
                isUp
                  ? 'bg-[#fff6e3] border-[#f2d6a2] shadow-inner'
                  : 'bg-gradient-to-br from-[#2a1f5a] to-[#4a3478] border-transparent hover:scale-[1.04] shadow-[0_8px_18px_-10px_rgba(42,31,90,0.8)]',
                matched.has(sym) && 'opacity-70',
              )}
            >
              {isUp ? <Icon className={cn('w-7 h-7 sm:w-8 sm:h-8', color)} /> : <Sun className="w-5 h-5 text-white/60" />}
            </button>
          )
        })}
      </div>

      {won && (
        <div className="rounded-xl bg-gradient-to-r from-[#fff1c9] to-[#ffd9b8] text-[#7a3f2a] p-3 text-center text-sm font-semibold">
          Все пары найдены за {moves} ходов. Солар сияет!
        </div>
      )}

      <Button variant="outline" onClick={restart} className="self-center gap-2">
        <RotateCcw className="w-4 h-4" />
        Начать заново
      </Button>
    </div>
  )
}
