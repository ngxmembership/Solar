// Frame for every forum page: morning sky, header with the way back to the site, footer.
import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ExternalLink, PenLine, Sun } from 'lucide-react'
import { FORUM_GITHUB_URL } from '../config'
import '../../solar/solar.css'
import '../forum.css'

export function ForumShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  // Cream page behind overscroll (the site itself uses night ink).
  useEffect(() => {
    const html = document.documentElement
    const prev = [html.style.backgroundColor, document.body.style.backgroundColor] as const
    html.style.backgroundColor = '#fff8ee'
    document.body.style.backgroundColor = '#fff8ee'
    return () => {
      html.style.backgroundColor = prev[0]
      document.body.style.backgroundColor = prev[1]
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="solar-root forum-root relative min-h-svh flex flex-col">
      <div aria-hidden className="forum-sky fixed inset-0 -z-0 pointer-events-none" />

      <header className="sticky top-0 z-40 border-b border-[color:var(--f-line)] bg-[#fff8ee]/90">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 text-sm font-semibold text-[color:var(--f-ink-soft)] hover:text-[color:var(--f-ink)] hover:bg-black/[0.04] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="relative inline-flex w-6 h-6 items-center justify-center">
                <span
                  aria-hidden
                  className="absolute -inset-1 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.6), rgba(252,211,77,0) 70%)' }}
                />
                <Sun className="relative w-5 h-5 text-[color:var(--s-ember)]" />
              </span>
              <span className="hidden sm:inline">Солар</span>
            </Link>
            <span aria-hidden className="h-5 w-px bg-[color:var(--f-line)]" />
            <Link to="/forum" className="solar-display text-base md:text-lg font-bold tracking-tight truncate">
              Круг Солара
            </Link>
          </div>
          <Link to="/forum/new" className="solar-btn solar-btn--ink !py-2 !px-3.5 sm:!px-4 shrink-0">
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">Начать беседу</span>
            <span className="sm:hidden">Беседа</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto w-full max-w-6xl px-4 md:px-8 pt-6 md:pt-10 pb-16">{children}</main>

      <footer className="relative z-10 border-t border-[color:var(--f-line)]">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[color:var(--f-ink-faint)]">
          <span className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" />Круг Солара · беседы, которые светят
          </span>
          <span className="flex items-center gap-4">
            <Link to="/" className="hover:text-[color:var(--f-ink)] transition-colors">
              На главную
            </Link>
            <a href={FORUM_GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[color:var(--f-ink)] transition-colors">
              Форум на GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
