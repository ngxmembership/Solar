// Solar — cinematic scroll site. This file only composes layers:
// WebGL canvas → cinematic overlays → header/rail → story chapters → footer → dialogs.
// Scene + scroll wiring lives in useSolarExperience; each chapter lives in solar/stages.
import { useEffect, useState } from 'react'
import { cn } from '../lib/shadcn/utils'
import { chapterTarget } from './solar/chapters'
import { ContentDialog, type Selection } from './solar/dialogs/ContentDialog'
import { DonateDialog } from './solar/dialogs/DonateDialog'
import { ChapterRail } from './solar/layout/ChapterRail'
import { CursorLight } from './solar/layout/CursorLight'
import { SiteHeader } from './solar/layout/SiteHeader'
import { BooksStage } from './solar/stages/BooksStage'
import { Epilogue } from './solar/stages/Epilogue'
import { GamesStage } from './solar/stages/GamesStage'
import { HeroStage } from './solar/stages/HeroStage'
import { MissionStage } from './solar/stages/MissionStage'
import { VideosStage } from './solar/stages/VideosStage'
import { useSolarExperience } from './solar/useSolarExperience'
import { useGames } from './solar/useGames'
import './solar/solar.css'

export default function SolarSite() {
  const xp = useSolarExperience()
  const [selection, setSelection] = useState<Selection>(null)
  const [donateOpen, setDonateOpen] = useState(false)
  const openDonate = () => setDonateOpen(true)
  const games = useGames()
  const { setPlanetColors, ready } = xp

  // Planets mirror the games (count + colors) once the scene exists.
  useEffect(() => {
    if (ready) setPlanetColors(games.map((g) => g.color))
  }, [games, ready, setPlanetColors])

  return (
    <div ref={xp.rootRef} className="solar-root relative min-h-svh">
      {/* Layer 0: 3D scene (or static fallback) */}
      <canvas
        ref={xp.canvasRef}
        aria-hidden
        data-ready={xp.ready}
        className={cn('solar-canvas fixed left-0 top-0 w-full h-lvh block', xp.webglFailed && 'hidden')}
      />
      {xp.webglFailed && <div aria-hidden className="solar-fallback fixed inset-0" />}
      {/* Instant CSS poster of the sealed, star-painted shell — visible from the first paint until 3D is ready */}
      <div aria-hidden data-ready={xp.ready} className="solar-poster pointer-events-none fixed inset-0">
        <span className="solar-poster-egg" />
      </div>

      {/* Layer 1: cinematic overlays — vignette fades with dawn, film grain on desktop */}
      <div ref={xp.fxRef} aria-hidden className="solar-fx">
        <div className="solar-vignette pointer-events-none fixed inset-0 z-[1]" />
        <div className="solar-grain pointer-events-none fixed inset-0 z-[1] hidden md:block" />
        <CursorLight />
      </div>

      {/* Layer 2: chrome */}
      <button
        onClick={() => xp.goTo(chapterTarget('videos'))}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 solar-btn solar-btn--sun"
      >
        Перейти к разделам
      </button>
      <SiteHeader light={xp.light} scrolled={xp.scrolled} chapter={xp.chapter} barRef={xp.barRef} onNav={xp.goTo} onDonate={openDonate} soundOn={xp.soundOn} onToggleSound={xp.toggleSound} />
      <ChapterRail light={xp.light} chapter={xp.chapter} onNav={xp.goTo} />

      {/* Layer 3: the story track — scroll progress 0..1 spans exactly this element */}
      <main ref={xp.trackRef} className="relative z-10">
        <HeroStage />
        <VideosStage onSelect={setSelection} />
        <BooksStage onSelect={setSelection} />
        <GamesStage games={games} onSelect={setSelection} onHighlight={xp.highlight} />
        <MissionStage onNav={xp.goTo} />
      </main>
      <div className="relative z-10">
        <Epilogue onDonate={openDonate} />
      </div>

      <ContentDialog selection={selection} onClose={() => setSelection(null)} />
      <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} />
    </div>
  )
}
