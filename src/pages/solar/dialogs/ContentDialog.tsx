// One branded dialog for whatever card the visitor opened: a video, a book summary or a game.
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, ExternalLink, Gamepad2, Play, Sparkles } from 'lucide-react'
import { Button } from '../../../lib/shadcn/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../lib/shadcn/dialog'
import { cn } from '../../../lib/shadcn/utils'
import type { Book, Game, Video } from '../content'
import { MemoryGame } from './MemoryGame'

export type Selection = { kind: 'video'; item: Video } | { kind: 'book'; item: Book } | { kind: 'game'; item: Game } | null

/** Games hosted with the site can be embedded; others (e.g. in an editor preview) open in a new tab. */
function isSameOrigin(url: string) {
  try {
    return new URL(url, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

function SoonNote({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">
      <Sparkles className="w-4 h-4 text-[#e08a2e] shrink-0" />
      {children}
    </div>
  )
}

export function ContentDialog({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const navigate = useNavigate()
  const embedUrl = selection?.kind === 'game' && selection.item.url && isSameOrigin(selection.item.url) ? selection.item.url : null
  return (
    <Dialog open={selection !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          'solar-dialog sm:rounded-[24px]',
          embedUrl ? 'max-w-[520px] w-[100vw] sm:w-[94vw] h-[100svh] sm:h-[92svh] max-h-none !p-0 !gap-0 rounded-none' : 'max-w-lg',
        )}
      >
        {selection?.kind === 'game' && embedUrl && (
          <>
            <div className="flex items-center gap-3 px-4 py-3 pr-12 border-b">
              <span
                className="w-6 h-6 rounded-full shrink-0"
                style={{ background: `radial-gradient(circle at 32% 28%, #fff, ${selection.item.color} 55%)` }}
              />
              <div className="min-w-0 flex-1">
                <DialogTitle className="solar-display text-base leading-tight truncate">{selection.item.title}</DialogTitle>
                <DialogDescription className="text-xs truncate">Нажмите на игру, чтобы включить звук</DialogDescription>
              </div>
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">В новой вкладке</span>
              </a>
            </div>
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={selection.item.title}
              allow="fullscreen; autoplay"
              allowFullScreen
              className="block w-full flex-1 min-h-0 border-0 bg-[#100c26]"
            />
          </>
        )}

        {selection?.kind === 'video' && (
          <>
            <div className={`relative -mx-6 -mt-6 aspect-video bg-gradient-to-br overflow-hidden ${selection.item.gradient}`}>
              <span className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/35 blur-3xl" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-white/25 backdrop-blur-sm border border-white/50">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </span>
              </span>
              <span className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-semibold text-white">
                <span className="rounded-full bg-black/30 px-2.5 py-1">{selection.item.tag}</span>
                <span className="flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1">
                  <Clock className="w-3 h-3" />
                  {selection.item.duration}
                </span>
              </span>
            </div>
            <DialogHeader>
              <DialogTitle className="solar-display text-xl leading-tight">{selection.item.title}</DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed text-body-foreground">{selection.item.description}</DialogDescription>
            </DialogHeader>
            {selection.item.route ? (
              <Button className="gap-2 self-start rounded-full px-5" onClick={() => navigate(selection.item.route!)}>
                <Play className="w-4 h-4" />
                Смотреть сейчас
              </Button>
            ) : (
              <SoonNote>Ролик скоро появится на канале</SoonNote>
            )}
          </>
        )}

        {selection?.kind === 'book' && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-14 h-[76px] rounded-[4px_8px_8px_4px] bg-gradient-to-br shadow-lg relative overflow-hidden ${selection.item.cover}`}>
                  <span className="absolute inset-y-0 left-0 w-1.5 bg-black/15" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="solar-display text-xl leading-tight">{selection.item.title}</DialogTitle>
                  <DialogDescription className="mt-1">
                    {selection.item.author} · {selection.item.minutes} мин чтения
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <DialogBody>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8641f] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Три главные идеи
              </h4>
              <ol className="flex flex-col gap-3">
                {selection.item.ideas.map((idea, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-body-foreground">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#fff1c9] to-[#ffd27a] text-[#7a3f2a] flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {idea}
                  </li>
                ))}
              </ol>
            </DialogBody>
            <SoonNote>Полное саммари и аудиоверсия скоро</SoonNote>
          </>
        )}

        {selection?.kind === 'game' && !embedUrl && (
          <>
            <DialogHeader>
              <DialogTitle className="solar-display text-xl flex items-center gap-2.5">
                <span
                  className="w-5 h-5 rounded-full shrink-0"
                  style={{ background: `radial-gradient(circle at 32% 28%, #fff, ${selection.item.color} 55%)` }}
                />
                {selection.item.title}
              </DialogTitle>
              <DialogDescription>{selection.item.description}</DialogDescription>
            </DialogHeader>
            <DialogBody>
              {selection.item.url ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <span
                    className="w-20 h-20 rounded-full shadow-[0_12px_30px_-8px_rgba(42,31,61,0.45)]"
                    style={{ background: `radial-gradient(circle at 32% 28%, #fff, ${selection.item.color} 55%)` }}
                  />
                  <a href={selection.item.url} target="_blank" rel="noopener noreferrer" className="solar-btn solar-btn--ink !px-7 !py-3.5">
                    <Gamepad2 className="w-4 h-4" />
                    Играть
                  </a>
                  <span className="text-xs text-muted-foreground">Игра откроется в новой вкладке</span>
                </div>
              ) : selection.item.playable ? (
                <MemoryGame />
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <Gamepad2 className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Эта планета ещё формируется. Игра скоро появится, а пока попробуйте «Память Солара».
                  </p>
                </div>
              )}
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
