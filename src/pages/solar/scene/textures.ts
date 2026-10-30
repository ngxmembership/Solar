// Procedural canvas textures for the two shell layers. UVs of every petal are remapped so one
// texture wraps the whole circumference — cracks and constellations continue across petal seams.
import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace } from 'three'

const rand = (a: number, b: number) => a + Math.random() * (b - a)

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function toTexture(c: HTMLCanvasElement, color: boolean, repeat = false) {
  const t = new CanvasTexture(c)
  t.colorSpace = color ? SRGBColorSpace : NoColorSpace
  if (repeat) {
    t.wrapS = RepeatWrapping
    t.wrapT = RepeatWrapping
  }
  t.anisotropy = 4
  t.needsUpdate = true
  return t
}

/** Walnut / raku-ceramic relief, used as a tiling bump map. */
export function makeReliefTexture(size = 512): CanvasTexture {
  const [c, ctx] = canvas(size, size)
  ctx.fillStyle = 'rgb(150,150,150)'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 4 + Math.random() * 26
    const v = 110 + Math.random() * 90
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${v},${v},${v},0.35)`)
    g.addColorStop(1, `rgba(${v},${v},${v},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  ctx.lineCap = 'round'
  for (let i = 0; i < 70; i++) {
    let x = Math.random() * size
    let y = Math.random() * size
    const len = 40 + Math.random() * 180
    const shade = 40 + Math.random() * 50
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.35 + Math.random() * 0.35})`
    ctx.lineWidth = 1 + Math.random() * 3.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let s = 0; s < len; s += 8) {
      x += (Math.random() - 0.5) * 6
      y += 8
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 28
    d[i] = Math.max(0, Math.min(255, d[i]! + n))
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1]! + n))
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2]! + n))
  }
  ctx.putImageData(img, 0, 0)
  return toTexture(c, false, true)
}

/**
 * Outer layer — a celestial sphere: deep enamel night with engraved stars, constellations,
 * little planets and a golden zodiac belt. Returns base color + emissive (stars) maps.
 */
export function makeCelestialTextures(w: number, h: number, seams: { count: number; phase: number; gap: number }) {
  const [colorC, col] = canvas(w, h)
  const grad = col.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0f0c26')
  grad.addColorStop(0.5, '#1d1747')
  grad.addColorStop(1, '#100c28')
  col.fillStyle = grad
  col.fillRect(0, 0, w, h)
  // Soft nebulae
  for (let i = 0; i < 26; i++) {
    const x = rand(0, w)
    const y = rand(h * 0.15, h * 0.85)
    const r = rand(h * 0.05, h * 0.16)
    const hue = Math.random() < 0.5 ? '120,90,200' : '70,110,200'
    const g = col.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${hue},0.22)`)
    g.addColorStop(1, `rgba(${hue},0)`)
    col.fillStyle = g
    col.fillRect(x - r, y - r, r * 2, r * 2)
  }

  const [emC, em] = canvas(w, h)
  em.fillStyle = '#000'
  em.fillRect(0, 0, w, h)
  const s = h / 512
  const star = (x: number, y: number, r: number, a: number, warm: boolean) => {
    const c = warm ? `255,214,150` : `235,235,255`
    const g = em.createRadialGradient(x, y, 0, x, y, r * 3)
    g.addColorStop(0, `rgba(${c},${a})`)
    g.addColorStop(0.35, `rgba(${c},${a * 0.5})`)
    g.addColorStop(1, `rgba(${c},0)`)
    em.fillStyle = g
    em.fillRect(x - r * 3, y - r * 3, r * 6, r * 6)
  }
  // Star field — thinner near the poles where the sphere narrows.
  const count = Math.round(w * h * 0.0016)
  for (let i = 0; i < count; i++) {
    const y = rand(h * 0.06, h * 0.94)
    const polar = Math.abs(y / h - 0.5) * 2
    if (Math.random() < polar * 0.7) continue
    star(rand(0, w), y, rand(0.4, 1.3) * s, rand(0.35, 1), Math.random() < 0.4)
  }
  // Bright sparkles with cross flares.
  em.lineCap = 'round'
  for (let i = 0; i < 22; i++) {
    const x = rand(0, w)
    const y = rand(h * 0.2, h * 0.8)
    const r = rand(1.4, 2.4) * s
    star(x, y, r, 1, true)
    em.strokeStyle = 'rgba(255,225,170,0.55)'
    em.lineWidth = 0.8 * s
    em.beginPath()
    em.moveTo(x - r * 5, y)
    em.lineTo(x + r * 5, y)
    em.moveTo(x, y - r * 5)
    em.lineTo(x, y + r * 5)
    em.stroke()
  }
  // Constellations — small chains of linked stars.
  for (let c = 0; c < 14; c++) {
    let x = rand(0, w)
    let y = rand(h * 0.22, h * 0.78)
    const pts: [number, number][] = [[x, y]]
    const n = 3 + Math.floor(Math.random() * 4)
    for (let k = 0; k < n; k++) {
      x += rand(-28, 28) * s
      y += rand(-22, 22) * s
      pts.push([x, y])
    }
    em.strokeStyle = 'rgba(255,210,140,0.32)'
    em.lineWidth = 0.7 * s
    em.beginPath()
    pts.forEach(([px, py], k) => (k === 0 ? em.moveTo(px, py) : em.lineTo(px, py)))
    em.stroke()
    pts.forEach(([px, py]) => star(px, py, 1.3 * s, 0.95, true))
  }
  // Little planets with rings.
  for (let i = 0; i < 6; i++) {
    const x = rand(0, w)
    const y = rand(h * 0.25, h * 0.75)
    const r = rand(3, 6) * s
    em.strokeStyle = 'rgba(255,205,130,0.75)'
    em.lineWidth = 0.9 * s
    em.beginPath()
    em.arc(x, y, r, 0, Math.PI * 2)
    em.stroke()
    em.beginPath()
    em.ellipse(x, y, r * 2, r * 0.6, -0.35, 0, Math.PI * 2)
    em.stroke()
  }
  // Golden zodiac belt along the equator.
  em.strokeStyle = 'rgba(255,200,120,0.55)'
  em.lineWidth = 0.9 * s
  for (const dy of [-0.055, 0.055]) {
    em.beginPath()
    em.moveTo(0, h * (0.5 + dy))
    em.lineTo(w, h * (0.5 + dy))
    em.stroke()
  }
  em.setLineDash([2 * s, 6 * s])
  em.beginPath()
  em.moveTo(0, h * 0.5)
  em.lineTo(w, h * 0.5)
  em.stroke()
  em.setLineDash([])
  for (let x = 0; x < w; x += w / 48) {
    em.beginPath()
    em.arc(x, h * 0.5, 1.6 * s, 0, Math.PI * 2)
    em.stroke()
  }
  // Fine gilded hairline along each petal edge with sparse beads (jewellery trim, not a band).
  const gapPx = (seams.gap / (Math.PI * 2)) * w
  for (let i = 0; i < seams.count; i++) {
    const sx = (((i + seams.phase) / seams.count) * w) % w
    for (const side of [-1, 1]) {
      const x = sx + side * (gapPx / 2 + 2.5 * s)
      em.strokeStyle = 'rgba(255,205,130,0.5)'
      em.lineWidth = 0.7 * s
      em.beginPath()
      em.moveTo(x, h * 0.04)
      em.lineTo(x, h * 0.96)
      em.stroke()
      em.fillStyle = 'rgba(255,224,170,0.75)'
      for (let y = h * 0.08; y < h * 0.92; y += 22 * s) {
        em.beginPath()
        em.arc(x, y, 0.8 * s, 0, Math.PI * 2)
        em.fill()
      }
    }
  }

  // Mirror the gold into the base color so it reads in daylight too.
  col.globalAlpha = 0.6
  col.drawImage(emC, 0, 0)
  col.globalAlpha = 1

  return { map: toTexture(colorC, true), emissiveMap: toTexture(emC, true) }
}

/**
 * Inner layer — matte ceramic mended with gold (kintsugi): the cracks are where light gets in.
 * Returns color, packed roughness(G)/metalness(B), and emissive vein maps.
 */
export function makeKintsugiTextures(w: number, h: number) {
  // Generate vein polylines once, draw them into every map.
  const veins: { pts: [number, number][]; width: number }[] = []
  const s = h / 512
  const grow = (x: number, y: number, len: number, width: number, depth: number) => {
    const pts: [number, number][] = [[x, y]]
    let dir = rand(-0.5, 0.5)
    for (let i = 0; i < len; i++) {
      dir += rand(-0.35, 0.35)
      dir = Math.max(-1.1, Math.min(1.1, dir))
      x += Math.sin(dir) * 6 * s
      y += Math.cos(dir) * 6 * s
      pts.push([x, y])
      if (depth < 2 && Math.random() < 0.06) grow(x, y, Math.floor(len * 0.4), width * 0.6, depth + 1)
    }
    veins.push({ pts, width })
  }
  for (let i = 0; i < 16; i++) grow(rand(0, w), rand(-h * 0.05, h * 0.5), Math.floor(rand(30, 70)), rand(1.4, 2.6) * s, 0)

  const drawVeins = (ctx: CanvasRenderingContext2D, style: string, widthMul = 1) => {
    ctx.strokeStyle = style
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const v of veins) {
      ctx.lineWidth = v.width * widthMul
      ctx.beginPath()
      v.pts.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
      ctx.stroke()
    }
  }

  // Base color: warm dark ceramic with mottling + gold veins.
  const [colorC, col] = canvas(w, h)
  col.fillStyle = '#2b211d'
  col.fillRect(0, 0, w, h)
  for (let i = 0; i < 260; i++) {
    const x = rand(0, w)
    const y = rand(0, h)
    const r = rand(8, 40) * s
    const g = col.createRadialGradient(x, y, 0, x, y, r)
    const tone = Math.random() < 0.5 ? '60,44,36' : '22,16,14'
    g.addColorStop(0, `rgba(${tone},0.35)`)
    g.addColorStop(1, `rgba(${tone},0)`)
    col.fillStyle = g
    col.fillRect(x - r, y - r, r * 2, r * 2)
  }
  drawVeins(col, '#d9a441')

  // Packed ORM: G = roughness (matte 0.92, gold 0.28), B = metalness (gold = 1).
  const [ormC, orm] = canvas(w, h)
  orm.fillStyle = 'rgb(0,235,0)'
  orm.fillRect(0, 0, w, h)
  drawVeins(orm, 'rgb(0,72,255)')

  // Emissive: veins glow from within as Solar wakes.
  const [emC, em] = canvas(w, h)
  em.fillStyle = '#000'
  em.fillRect(0, 0, w, h)
  em.filter = `blur(${1.5 * s}px)`
  drawVeins(em, 'rgba(255,190,110,0.7)', 2.2)
  em.filter = 'none'
  drawVeins(em, '#fff1d0', 0.7)

  return { map: toTexture(colorC, true), ormMap: toTexture(ormC, false), emissiveMap: toTexture(emC, true) }
}
