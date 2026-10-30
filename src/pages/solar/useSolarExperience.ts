// Owns the 3D scene + scroll director lifecycle and exposes the few UI states React needs.
// High-frequency values (progress, bar width, --p) are written straight to the DOM, not to state.
import { useCallback, useEffect, useRef, useState } from 'react'
import { AmbientSound } from './ambient'
import { chapterIndexAt, LIGHT_FROM } from './chapters'
import { SolarScene } from './scene/SolarScene'
import { startScrollDirector, type ScrollDirector } from './scrollDirector'

export function useSolarExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SolarScene | null>(null)
  const directorRef = useRef<ScrollDirector | null>(null)
  const ambientRef = useRef(new AmbientSound())
  const [soundOn, setSoundOn] = useState(false)

  const [ready, setReady] = useState(false)
  const [webglFailed, setWebglFailed] = useState(false)
  const [light, setLight] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [chapter, setChapter] = useState(0)

  // Dark page behind overscroll and before the first frame — no white flash.
  useEffect(() => {
    const html = document.documentElement
    const prev = [html.style.backgroundColor, document.body.style.backgroundColor] as const
    html.style.backgroundColor = '#100c26'
    document.body.style.backgroundColor = '#100c26'
    return () => {
      html.style.backgroundColor = prev[0]
      document.body.style.backgroundColor = prev[1]
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    const track = trackRef.current
    if (!canvas || !root || !track) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768

    let scene: SolarScene | null = null
    try {
      scene = new SolarScene(canvas, { isMobile, reducedMotion, onReady: () => setReady(true) })
      sceneRef.current = scene
    } catch (err) {
      console.warn('WebGL unavailable, showing static fallback', err)
      setWebglFailed(true)
      setReady(true)
    }

    // Local mirrors so state is only set when a threshold is actually crossed.
    const ui = { light: false, scrolled: false, chapter: 0 }
    const director = startScrollDirector(
      root,
      track,
      (p, v) => {
        scene?.setProgress(p)
        scene?.setVelocity(v)
        ambientRef.current.setProgress(p)
        root.style.setProperty('--p', p.toFixed(4))
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
        const nextLight = p >= LIGHT_FROM
        if (nextLight !== ui.light) setLight((ui.light = nextLight))
        const nextScrolled = window.scrollY > 24
        if (nextScrolled !== ui.scrolled) setScrolled((ui.scrolled = nextScrolled))
        const nextChapter = chapterIndexAt(p)
        if (nextChapter !== ui.chapter) setChapter((ui.chapter = nextChapter))
      },
      reducedMotion,
    )
    directorRef.current = director

    const ro = new ResizeObserver(() => scene?.resize())
    ro.observe(canvas)
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      scene?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    const ambient = ambientRef.current

    return () => {
      ambient.stop()
      window.removeEventListener('pointermove', onPointer)
      ro.disconnect()
      director.stop()
      scene?.dispose()
      sceneRef.current = null
      directorRef.current = null
    }
  }, [])

  const goTo = useCallback((p: number) => directorRef.current?.scrollToProgress(p), [])
  const highlight = useCallback((i: number | null) => sceneRef.current?.setHighlight(i), [])
  const setPlanetColors = useCallback((colors: string[]) => sceneRef.current?.setGames(colors), [])
  const toggleSound = useCallback(() => {
    const a = ambientRef.current
    if (a.running) a.stop()
    else a.start()
    setSoundOn(a.running)
  }, [])

  return { canvasRef, rootRef, trackRef, barRef, ready, webglFailed, light, scrolled, chapter, soundOn, goTo, highlight, toggleSound, setPlanetColors }
}
