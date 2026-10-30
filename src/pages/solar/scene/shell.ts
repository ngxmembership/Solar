// The sealed shell, two nested layers of 8 petals each:
//  • outer — a celestial sphere (night enamel with stars, constellations, zodiac belt), gilded inside;
//  • inner — matte ceramic mended with gold (kintsugi), pearl inside; its gold veins glow as Solar wakes.
// Gaps between petals are the cracks light leaks through. Each petal pivots on the bottom pole and
// follows its target angle through a spring, so motion feels physical.
import {
  BackSide,
  FrontSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
  type Material,
  type Texture,
} from 'three'
import { clamp } from '../sceneMath'
import { SHELL, SHELL_LAYERS } from './choreography'
import { makeCelestialTextures, makeKintsugiTextures, makeReliefTexture } from './textures'

interface Petal {
  pivot: Group
  axis: Vector3
  angle: number
  vel: number
  k: number
  c: number
  delay: number
}

interface LayerConfig {
  radius: number
  maxAngle: number
  gap: number
  /** Rotational offset in petal widths, so the two layers' seams don't line up. */
  phase: number
}

class ShellLayer {
  readonly group = new Group()
  private petals: Petal[] = []
  private cfg: LayerConfig

  constructor(cfg: LayerConfig, outside: Material, inside: Material, detail: { w: number; h: number }) {
    this.cfg = cfg
    const n = SHELL.petals
    const seg = (Math.PI * 2) / n
    for (let i = 0; i < n; i++) {
      const phiStart = (i + cfg.phase) * seg + cfg.gap / 2
      const phiLen = seg - cfg.gap
      const geo = new SphereGeometry(cfg.radius, detail.w, detail.h, phiStart, phiLen, 0, Math.PI)
      // One texture wraps the whole sphere: remap each petal's U to its angular slot.
      const uv = geo.attributes['uv']!
      for (let k = 0; k < uv.count; k++) uv.setX(k, (phiStart + uv.getX(k) * phiLen) / (Math.PI * 2))
      uv.needsUpdate = true
      geo.translate(0, cfg.radius, 0)

      const pivot = new Group()
      pivot.position.set(0, -cfg.radius, 0)
      pivot.add(new Mesh(geo, outside), new Mesh(geo, inside))

      // Open outward around the horizontal axis perpendicular to the petal's mid-direction.
      const mid = phiStart + phiLen / 2
      const dx = -Math.cos(mid)
      const dz = Math.sin(mid)
      const rank = (SHELL.order as readonly number[]).indexOf(i)
      const k = 16 + rank * 1.5
      this.petals.push({
        pivot,
        axis: new Vector3(dz, 0, -dx).normalize(),
        angle: 0,
        vel: 0,
        k,
        // Near-critical damping: petals glide and settle without wobble.
        c: 2 * Math.sqrt(k) * 0.85,
        delay: rank / (n - 1),
      })
      this.group.add(pivot)
    }
  }

  update(open: number, dt: number, reducedMotion: boolean) {
    for (const pt of this.petals) {
      const target = this.cfg.maxAngle * clamp(open * 1.25 - pt.delay * 0.25)
      if (reducedMotion) {
        pt.angle = target
        pt.vel = 0
      } else {
        const a = pt.k * (target - pt.angle) - pt.c * pt.vel
        pt.vel += a * dt
        pt.angle += pt.vel * dt
      }
      pt.pivot.quaternion.setFromAxisAngle(pt.axis, pt.angle)
    }
  }
}

export class Shell {
  readonly group = new Group()
  private outer: ShellLayer
  private inner: ShellLayer
  private skyMat: MeshStandardMaterial
  private ceramicMat: MeshStandardMaterial
  private textures: Texture[] = []

  constructor(isMobile: boolean) {
    const texW = isMobile ? 1024 : 2048
    const texH = isMobile ? 512 : 1024
    const relief = makeReliefTexture(isMobile ? 256 : 512)
    relief.repeat.set(6, 3)
    const sky = makeCelestialTextures(texW, texH, { count: SHELL.petals, phase: SHELL_LAYERS.outer.phase, gap: SHELL_LAYERS.outer.gap })
    const kin = makeKintsugiTextures(texW, texH)
    this.textures.push(relief, sky.map, sky.emissiveMap, kin.map, kin.ormMap, kin.emissiveMap)

    // Outer: celestial enamel — slightly satin so the moon rim catches it.
    this.skyMat = new MeshStandardMaterial({
      map: sky.map,
      emissiveMap: sky.emissiveMap,
      emissive: 0xffffff,
      emissiveIntensity: 1.1,
      roughness: 0.78,
      metalness: 0.05,
      bumpMap: relief,
      bumpScale: 0.6,
      envMapIntensity: 0.6,
      side: FrontSide,
    })
    // Gilded inside of the sky: catches Solar's light as the outer petals fall open.
    const gilded = new MeshStandardMaterial({
      color: 0xf2d6a2,
      metalness: 0.75,
      roughness: 0.38,
      bumpMap: relief,
      bumpScale: 0.8,
      emissive: 0x3a2410,
      emissiveIntensity: 0.35,
      side: BackSide,
    })
    // Inner: matte ceramic with gold kintsugi veins.
    this.ceramicMat = new MeshStandardMaterial({
      map: kin.map,
      roughnessMap: kin.ormMap,
      metalnessMap: kin.ormMap,
      roughness: 1,
      metalness: 1,
      emissiveMap: kin.emissiveMap,
      emissive: 0xffb547,
      emissiveIntensity: 0.2,
      bumpMap: relief,
      bumpScale: 2.2,
      envMapIntensity: 0.7,
      side: FrontSide,
    })
    const pearl = new MeshPhysicalMaterial({
      color: 0xf3dccf,
      roughness: 0.28,
      metalness: 0.05,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [200, 650],
      sheen: 0.6,
      sheenColor: 0xffc8a8,
      emissive: 0x3a2014,
      emissiveIntensity: 0.4,
      side: BackSide,
    })

    const detail = { w: isMobile ? 10 : 14, h: isMobile ? 28 : 40 }
    this.outer = new ShellLayer(SHELL_LAYERS.outer, this.skyMat, gilded, detail)
    this.inner = new ShellLayer(SHELL_LAYERS.inner, this.ceramicMat, pearl, detail)
    this.group.add(this.outer.group, this.inner.group)
  }

  update(o: { openOuter: number; openInner: number; glow: number; stars: number; progress: number; dt: number; reducedMotion: boolean }) {
    this.outer.update(o.openOuter, o.dt, o.reducedMotion)
    this.inner.update(o.openInner, o.dt, o.reducedMotion)
    this.skyMat.emissiveIntensity = o.stars
    // Kintsugi veins: faint ember while sealed, bright gold once Solar shines.
    this.ceramicMat.emissiveIntensity = 0.2 + o.glow * 1.8
    this.group.rotation.y = o.progress * Math.PI * 0.5
  }

  dispose() {
    this.textures.forEach((t) => t.dispose())
  }
}
