// Desktop only: a soft warm light that follows the cursor through the night chapters —
// "light in your hands". Fades out as the sky turns to morning (driven by --p).
import { useEffect, useRef } from 'react'

export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(pointer: fine)').matches) return
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { ...target }
    let raf = 0
    let running = false

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.14
      pos.y += (target.y - pos.y) * 0.14
      el.style.transform = `translate3d(${pos.x - 260}px, ${pos.y - 260}px, 0)`
      if (Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.5) raf = requestAnimationFrame(tick)
      else running = false
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      target.x = e.clientX
      target.y = e.clientY
      el.style.visibility = 'visible'
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} aria-hidden className="solar-cursor-light pointer-events-none fixed left-0 top-0 z-[1] hidden md:block" />
}
