// Procedural canvas textures for the two shell layers. UVs of every petal are remapped so one
// texture wraps the whole circumference — cracks and constellations continue across petal seams.
// Detail maps (color, emissive) are full size; roughness/metalness maps are half size — they only
// need to separate gold from enamel, which keeps GPU memory and startup time down.
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

type Pt = [number, number]

/**
 * Outer layer — an enamel celestial sphere with real gold inlay (Fabergé-like):
 *  • map: deep night enamel + gold lines/planets/zodiac belt/seam filigree;
 *  • ormMap (half size): G = roughness, B = metalness — gold is metal, enamel is not;
 *  • emissiveMap: only the stars glow (gold reflects light instead of emitting it).
 */
export function makeCelestialTextures(w: number, h: number, seams: { count: number; phase: number; gap: number }) {
  const s = h / 512

  // ---- Layout first, so every map draws exactly the same design ----
  const stars: { x: number; y: number; r: number; a: number; warm: boolean }[] = []
  const count = Math.round(w * h * 0.0016)
  for (let i = 0; i < count; i++) {
    const y = rand(h * 0.06, h * 0.94)
    const polar = Math.abs(y / h - 0.5) * 2
    if (Math.random() < polar * 0.7) continue
    stars.push({ x: rand(0, w), y, r: rand(0.4, 1.3) * s, a: rand(0.35, 1), warm: Math.random() < 0.4 })
  }
  const sparkles: Pt[] = Array.from({ length: 22 }, () => [rand(0, w), rand(h * 0.2, h * 0.8)])
  const constellations: Pt[][] = Array.from({ length: 14 }, () => {
    let x = rand(0, w)
    let y = rand(h * 0.22, h * 0.78)
    const pts: Pt[] = [[x, y]]
    const n = 3 + Math.floor(Math.random() * 4)
    for (let k = 0; k < n; k++) {
      x += rand(-28, 28) * s
      y += rand(-22, 22) * s
      pts.push([x, y])
    }
    return pts
  })
  const planets = Array.from({ length: 6 }, () => ({ x: rand(0, w), y: rand(h * 0.25, h * 0.75), r: rand(3, 6) * s }))
  const gapPx = (seams.gap / (Math.PI * 2)) * w
  const seamXs: number[] = []
  for (let i = 0; i < seams.count; i++) {
    const sx = (((i + seams.phase) / seams.count) * w) % w
    for (const side of [-1, 1]) seamXs.push(sx + side * (gapPx / 2 + 2.5 * s))
  }

  /** Draws every gold element with the given style (used for color, ORM and faint emissive). */
  const drawGold = (ctx: CanvasRenderingContext2D, stroke: string, fill: string, k = 1) => {
    ctx.save()
    ctx.scale(k, k)
    ctx.lineCap = 'round'
    ctx.strokeStyle = stroke
    ctx.fillStyle = fill
    // constellation lines
    ctx.lineWidth = 0.9 * s
    for (const pts of constellations) {
      ctx.beginPath()
      pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)))
      ctx.stroke()
    }
    // little planets with rings
    ctx.lineWidth = 1.1 * s
    for (const p of planets) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(p.x, p.y, p.r * 2, p.r * 0.6, -0.35, 0, Math.PI * 2)
      ctx.stroke()
    }
    // zodiac belt
    ctx.lineWidth = 1.2 * s
    for (const dy of [-0.055, 0.055]) {
      ctx.beginPath()
      ctx.moveTo(0, h * (0.5 + dy))
      ctx.lineTo(w, h * (0.5 + dy))
      ctx.stroke()
    }
    ctx.setLineDash([2 * s, 6 * s])
    ctx.beginPath()
    ctx.moveTo(0, h * 0.5)
    ctx.lineTo(w, h * 0.5)
    ctx.stroke()
    ctx.setLineDash([])
    for (let x = 0; x < w; x += w / 48) {
      ctx.beginPath()
      ctx.arc(x, h * 0.5, 1.6 * s, 0, Math.PI * 2)
      ctx.stroke()
    }
    // seam filigree: hairline + sparse beads
    ctx.lineWidth = 0.9 * s
    for (const x of seamXs) {
      ctx.beginPath()
      ctx.moveTo(x, h * 0.04)
      ctx.lineTo(x, h * 0.96)
      ctx.stroke()
      for (let y = h * 0.08; y < h * 0.92; y += 22 * s) {
        ctx.beginPath()
        ctx.arc(x, y, 1 * s, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()
  }

  // ---- Color: night enamel + gold inlay ----
  const [colorC, col] = canvas(w, h)
  const grad = col.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0d0a22')
  grad.addColorStop(0.5, '#1b1544')
  grad.addColorStop(1, '#0e0b25')
  col.fillStyle = grad
  col.fillRect(0, 0, w, h)
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
  // faint painted stars in the enamel itself
  col.fillStyle = 'rgba(230,225,255,0.55)'
  for (const st of stars) {
    col.beginPath()
    col.arc(st.x, st.y, st.r * 0.8, 0, Math.PI * 2)
    col.fill()
  }
  drawGold(col, '#e3b75e', '#f2cf7a')

  // ---- ORM (half size): enamel = glossy dielectric, gold = polished metal ----
  const [ormC, orm] = canvas(w / 2, h / 2)
  orm.fillStyle = 'rgb(0,110,0)' // roughness ≈ 0.43 under the clearcoat, metalness 0
  orm.fillRect(0, 0, w / 2, h / 2)
  drawGold(orm, 'rgb(0,70,255)', 'rgb(0,70,255)', 0.5)

  // ---- Emissive: stars glow; gold only a whisper so it reads in the dark ----
  const [emC, em] = canvas(w, h)
  em.fillStyle = '#000'
  em.fillRect(0, 0, w, h)
  // One pre-rendered glow sprite per tint, stamped with drawImage: ~10× faster than a gradient per star.
  const sprite = (c: string) => {
    const [sc, sx] = canvas(32, 32)
    const g = sx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, `rgba(${c},1)`)
    g.addColorStop(0.35, `rgba(${c},0.5)`)
    g.addColorStop(1, `rgba(${c},0)`)
    sx.fillStyle = g
    sx.fillRect(0, 0, 32, 32)
    return sc
  }
  const warmSprite = sprite('255,214,150')
  const coolSprite = sprite('235,235,255')
  const star = (x: number, y: number, r: number, a: number, warm: boolean) => {
    em.globalAlpha = a
    em.drawImage(warm ? warmSprite : coolSprite, x - r * 3, y - r * 3, r * 6, r * 6)
    em.globalAlpha = 1
  }
  for (const st of stars) star(st.x, st.y, st.r, st.a, st.warm)
  for (const pts of constellations) for (const [px, py] of pts) star(px, py, 1.3 * s, 0.95, true)
  em.lineCap = 'round'
  for (const [x, y] of sparkles) {
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
  drawGold(em, 'rgba(255,200,120,0.16)', 'rgba(255,215,150,0.2)')

  return { map: toTexture(colorC, true), ormMap: toTexture(ormC, false), emissiveMap: toTexture(emC, true) }
}

/**
 * Inner layer — matte ceramic mended with gold (kintsugi): the cracks are where light gets in.
 * Returns color, packed roughness(G)/metalness(B) at half size, and emissive vein maps.
 */
export function makeKintsugiTextures(w: number, h: number) {
  const veins: { pts: Pt[]; width: number }[] = []
  const s = h / 512
  const grow = (x: number, y: number, len: number, width: number, depth: number) => {
    const pts: Pt[] = [[x, y]]
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

  const drawVeins = (ctx: CanvasRenderingContext2D, style: string, widthMul = 1, k = 1) => {
    ctx.save()
    ctx.scale(k, k)
    ctx.strokeStyle = style
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const v of veins) {
      ctx.lineWidth = v.width * widthMul
      ctx.beginPath()
      v.pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
      ctx.stroke()
    }
    ctx.restore()
  }

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

  // Packed ORM at half size: G = roughness (matte 0.92, gold 0.28), B = metalness (gold = 1).
  const [ormC, orm] = canvas(w / 2, h / 2)
  orm.fillStyle = 'rgb(0,235,0)'
  orm.fillRect(0, 0, w / 2, h / 2)
  drawVeins(orm, 'rgb(0,72,255)', 1.4, 0.5)

  const [emC, em] = canvas(w, h)
  em.fillStyle = '#000'
  em.fillRect(0, 0, w, h)
  em.filter = `blur(${1.5 * s}px)`
  drawVeins(em, 'rgba(255,190,110,0.7)', 2.2)
  em.filter = 'none'
  drawVeins(em, '#fff1d0', 0.7)

  return { map: toTexture(colorC, true), ormMap: toTexture(ormC, false), emissiveMap: toTexture(emC, true) }
}
