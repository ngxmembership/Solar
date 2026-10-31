// Lightweight scroll director: reads scroll once per frame, reports global progress + velocity,
// and scrubs every [data-panel] reveal as a pure function of its section position,
// so reverse scroll replays exactly.
import { clamp, range } from './sceneMath'

type Mode = 'hero' | 'mid' | 'end' | 'beat' | 'reveal'

interface PanelInfo {
  el: HTMLElement
  section: HTMLElement
  mode: Mode
  items: HTMLElement[]
  letters: HTMLElement[]
  /** For 'beat': [inStart, inEnd, outStart, outEnd] in viewport heights scrolled into the section. */
  beat: [number, number, number, number]
  cache: Map<HTMLElement, string>
}

function write(p: PanelInfo, el: HTMLElement, alpha: number, y: number) {
  const a = alpha > 0.995 ? 1 : alpha < 0.005 ? 0 : alpha
  const ty = Math.abs(y) < 0.25 ? 0 : y
  const key = `${a.toFixed(3)}|${ty.toFixed(1)}`
  if (p.cache.get(el) === key) return
  p.cache.set(el, key)
  // While moving, translate3d keeps the element on its own GPU layer (no repaint per frame).
  // At rest (fully shown, in place) the layer is released, so dozens of cards don't pin
  // GPU memory on weak phones; hidden elements are skipped by paint entirely.
  const settled = a === 1 && ty === 0
  el.style.opacity = String(a)
  el.style.transform = settled ? 'none' : `translate3d(0, ${ty}px, 0)`
  el.style.visibility = a === 0 ? 'hidden' : 'visible'
}

function applyPanel(p: PanelInfo, vh: number, r: DOMRect, compact: boolean) {
  const H = r.height / vh

  if (p.mode === 'beat') {
    const u = -r.top / vh
    const [a, b, c, d] = p.beat
    const always = a < 0 && b < 0
    const inT = always ? 1 : range(u, a, b)
    const outT = range(u, c, d)
    write(p, p.el, Math.min(inT, 1 - outT), (1 - inT) * 30 - outT * 40)
    p.items.forEach((el, i) => {
      const t = always ? 1 : range(u, a + (b - a) * 0.3 + i * 0.05, b + i * 0.05)
      write(p, el, t, (1 - t) * 18)
    })
    return
  }

  if (p.mode === 'hero') {
    const u = -r.top / vh
    const t = range(u, 0.2, 0.95)
    write(p, p.el, 1 - t, -t * 60)
    return
  }

  const u = (vh - r.top) / vh

  if (p.mode === 'reveal') {
    // Normal-flow blocks: fade up as soon as they enter, stay visible.
    const inT = range(u, 0.04, 0.32)
    write(p, p.el, inT, (1 - inT) * 40)
    p.items.forEach((el, i) => {
      const t = range(u, 0.1 + i * 0.05, 0.38 + i * 0.05)
      write(p, el, t, (1 - t) * 24)
    })
    return
  }

  if (p.mode === 'mid') {
    const inT = range(u, 0.45, 1)
    const outT = range(u, H, H + 0.45)
    // Slow drift along the scroll for the whole life of the chapter, so the panel never feels
    // pinned: it enters slightly low and leaves slightly high (reverse scroll replays it exactly).
    // Phones: the panel sits at the bottom edge, so it only drifts upward.
    const life = range(u, 0.45, H + 0.45)
    const drift = compact ? -life * vh * 0.05 : (0.5 - life) * vh * 0.14
    write(p, p.el, Math.min(inT, 1 - outT), (1 - inT) * 50 - outT * 50 + drift)
    p.items.forEach((el, i) => {
      const t = range(u, 0.6 + i * 0.07, 0.95 + i * 0.07)
      write(p, el, t, (1 - t) * 28)
    })
    return
  }

  // 'end': fades in and stays (last section).
  const inT = range(u, 0.2, 0.7)
  write(p, p.el, inT, (1 - inT) * 40)
  p.letters.forEach((el, i) => {
    const t = range(u, 0.25 + i * 0.02, 0.45 + i * 0.02)
    write(p, el, t, (1 - t) * 24)
  })
  p.items.forEach((el, i) => {
    const t = range(u, 0.45 + i * 0.06, 0.65 + i * 0.06)
    write(p, el, t, (1 - t) * 24)
  })
}

function parseBeat(raw: string | undefined): [number, number, number, number] {
  const n = (raw ?? '').split(',').map(Number)
  return [n[0] ?? 0, n[1] ?? 0.5, n[2] ?? 1, n[3] ?? 1.5]
}

export interface ScrollDirector {
  stop: () => void
  refresh: () => void
  /** Scroll to a global progress value (0..1). */
  scrollToProgress: (p: number) => void
}

export function startScrollDirector(
  root: HTMLElement,
  track: HTMLElement,
  onProgress: (progress: number, velocity: number) => void,
  reducedMotion: boolean,
): ScrollDirector {
  let panels: PanelInfo[] = []
  let raf = 0
  let pending = false
  let lastScrolled = 0
  let lastT = performance.now()

  // The sections are sized in svh; measure the same unit instead of trusting window.innerHeight,
  // which can differ inside frames and on mobile (address bar).
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
  document.body.appendChild(probe)
  const viewport = () => probe.getBoundingClientRect().height || window.innerHeight

  const collect = () => {
    panels = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]')).map((el) => ({
      el,
      section: (el.closest('section') as HTMLElement | null) ?? el,
      mode: (el.dataset['panel'] as Mode | undefined) ?? 'mid',
      items: Array.from(el.querySelectorAll<HTMLElement>('[data-item]')),
      letters: Array.from(el.querySelectorAll<HTMLElement>('[data-letter]')),
      beat: parseBeat(el.dataset['beat']),
      cache: new Map(),
    }))
  }

  // Progress 0..1 spans the story track only, read from the track's own position, so it is correct
  // whichever element actually scrolls. Content below the track (epilogue) scrolls past at progress 1.
  const measure = () => {
    const rect = track.getBoundingClientRect()
    const vh = viewport()
    const scrolled = -rect.top
    const max = Math.max(1, rect.height - vh)
    return { vh, scrolled, max, trackTop: rect.top + window.scrollY }
  }

  const update = () => {
    pending = false
    // Phase 1 — read everything (one layout pass)…
    const { vh, scrolled, max } = measure()
    const rects = panels.map((p) => p.section.getBoundingClientRect())
    const compact = window.innerWidth < 768
    const now = performance.now()
    const v = ((scrolled - lastScrolled) / Math.max(1, now - lastT)) * 1000
    lastScrolled = scrolled
    lastT = now
    // Phase 2 — …then write. Interleaving reads and writes would force extra layouts every frame.
    onProgress(clamp(scrolled / max), v)
    panels.forEach((p, i) => applyPanel(p, vh, rects[i]!, compact))
  }

  const schedule = () => {
    if (pending) return
    pending = true
    raf = requestAnimationFrame(update)
  }

  const onResize = () => {
    for (const p of panels) p.cache.clear()
    schedule()
  }

  collect()
  update()
  // Capture phase: hears scrolling of the window *or* of any scrolling ancestor.
  document.addEventListener('scroll', schedule, { passive: true, capture: true })
  window.addEventListener('resize', onResize)

  // React may replace panel nodes (tab switches): re-scan so no panel is left unstyled.
  let rescanPending = false
  const observer = new MutationObserver(() => {
    if (rescanPending) return
    rescanPending = true
    requestAnimationFrame(() => {
      rescanPending = false
      collect()
      update()
    })
  })
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-beat', 'data-panel'] })

  return {
    stop: () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      probe.remove()
      document.removeEventListener('scroll', schedule, { capture: true })
      window.removeEventListener('resize', onResize)
    },
    refresh: () => {
      collect()
      schedule()
    },
    scrollToProgress: (p: number) => {
      const { max, trackTop } = measure()
      window.scrollTo({ top: trackTop + clamp(p) * max, behavior: reducedMotion ? 'auto' : 'smooth' })
    },
  }
}
