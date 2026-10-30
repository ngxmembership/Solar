// "Поддержать Солар": gentle donation dialog with amount presets and a share fallback.
import { useState } from 'react'
import { Check, Heart, Share2, Sparkles } from 'lucide-react'
import { Button } from '../../../lib/shadcn/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../lib/shadcn/dialog'
import { cn } from '../../../lib/shadcn/utils'
import { DONATE_AMOUNTS, DONATE_URL } from '../content'

export function DonateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [amount, setAmount] = useState<number>(DONATE_AMOUNTS[1])
  const [shared, setShared] = useState(false)

  const share = async () => {
    const url = window.location.href.split('?')[0] ?? window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Солар', text: 'Знания, которые светят', url })
      } else {
        await navigator.clipboard.writeText(url)
      }
      setShared(true)
      window.setTimeout(() => setShared(false), 2500)
    } catch {
      /* user cancelled share sheet */
    }
  }

  const donate = () => {
    if (!DONATE_URL) return
    window.open(`${DONATE_URL}${DONATE_URL.includes('?') ? '&' : '?'}amount=${amount}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="solar-dialog max-w-md sm:rounded-[24px]">
        <DialogHeader>
          <div className="mx-auto sm:mx-0 mb-2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
            <Heart className="w-6 h-6 text-orange-700 fill-orange-700/20" />
          </div>
          <DialogTitle className="solar-display text-xl">Поддержать Солар</DialogTitle>
          <DialogDescription>
            Все наши проекты сделаны на средства команды. Ваша поддержка помогает выпускать новые ролики, саммари и игры.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div>
            <div className="text-sm font-medium mb-2">Подарить свет</div>
            <div className="grid grid-cols-4 gap-2">
              {DONATE_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={cn(
                    'rounded-xl border py-2.5 text-sm font-semibold transition-colors',
                    amount === a
                      ? 'border-orange-400 bg-orange-50 text-orange-800 shadow-[0_6px_16px_-8px_rgba(224,138,46,0.7)]'
                      : 'bg-white/60 hover:bg-accent',
                  )}
                >
                  {a} ₽
                </button>
              ))}
            </div>
          </div>

          <Button onClick={donate} disabled={!DONATE_URL} className="gap-2 rounded-full h-11">
            <Sparkles className="w-4 h-4" />
            Поддержать на {amount} ₽
          </Button>
          {!DONATE_URL && (
            <p className="text-xs text-muted-foreground text-center -mt-2">Ссылка на оплату появится совсем скоро</p>
          )}

          <div className="rounded-xl bg-muted p-3 flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium">Помочь можно и иначе</div>
              <div className="text-muted-foreground text-xs">Расскажите о нас друзьям — это тоже свет</div>
            </div>
            <Button variant="outline" size="sm" onClick={share} className="gap-1.5 shrink-0">
              {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {shared ? 'Готово' : 'Поделиться'}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
