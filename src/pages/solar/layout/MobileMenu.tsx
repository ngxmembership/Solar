// Mobile chapter menu: a slide-in sheet with the story chapters and the support CTA.
import { useState } from 'react'
import { Heart, Menu } from 'lucide-react'
import { cn } from '../../../lib/shadcn/utils'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../../../lib/shadcn/sheet'
import { CHAPTERS } from '../chapters'

interface Props {
  light: boolean
  chapter: number
  onNav: (progress: number) => void
  onDonate: () => void
}

export function MobileMenu({ light, chapter, onNav, onDonate }: Props) {
  const [open, setOpen] = useState(false)
  // Let the sheet release its scroll lock before scrolling the page.
  const after = (fn: () => void) => {
    setOpen(false)
    window.setTimeout(fn, 320)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Открыть меню разделов"
          className={cn(
            'md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors',
            light ? 'border-[#2a1f3d]/15 bg-white/50' : 'border-white/15 bg-white/[0.06]',
          )}
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="solar-dialog w-[82%] flex flex-col bg-gradient-to-b from-[#fffaf2] to-[#ffe9d2]">
        <SheetHeader className="text-left">
          <SheetTitle className="solar-display text-2xl">Солар</SheetTitle>
          <SheetDescription>Знания, которые светят</SheetDescription>
        </SheetHeader>
        <nav aria-label="Разделы" className="mt-6 flex flex-col">
          {CHAPTERS.map((c, i) => {
            const active = i === chapter
            return (
              <button
                key={c.id}
                onClick={() => after(() => onNav(c.target))}
                className={cn(
                  'flex items-center gap-4 py-3.5 border-b border-[#2a1f3d]/[0.07] text-left transition-colors',
                  active ? 'text-[#2a1f3d]' : 'text-[#2a1f3d]/60',
                )}
              >
                <span className={cn('solar-display text-xs w-6', active ? 'text-[#e08a2e]' : 'text-[#2a1f3d]/35')}>0{i}</span>
                <span className="text-lg font-semibold">{c.label}</span>
                {active && <span className="ml-auto w-2 h-2 rounded-full bg-[#ffb547] shadow-[0_0_10px_3px_rgba(255,181,71,0.6)]" />}
              </button>
            )
          })}
        </nav>
        <button onClick={() => after(onDonate)} className="solar-btn solar-btn--ink mt-auto w-full !py-3.5">
          <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
          Поддержать проект
        </button>
      </SheetContent>
    </Sheet>
  )
}
