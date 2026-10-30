// The sealed shell: two nested layers of 8 solid petals.
//  • outer — enamel celestial sphere with gold inlay under a clear lacquer; gilded inside, gold rims;
//  • inner — matte raku ceramic mended with gold (kintsugi); pearl inside, unglazed biscuit rims.
// Each petal is a real solid: outer face + inner face + rim strips along both broken edges, so the
// shell reads as a thick crafted object instead of paper. Gaps between petals are the cracks light
// leaks through. Petals pivot on the bottom pole and follow their target angle through a spring.
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
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
  thickness: number
  maxAngle: number
  gap: number
  /** Rotational offset in petal widths, so the two layers' seams don't line up. */
  phase: number
}

interface LayerMaterials {
  outside: Material
  inside: Material
  rim: Material
}

/** SphereGeometry's own parametrisation, so rims meet the faces exactly. */
const spherePoint = (r: number, phi: number, theta: number) =>
  [-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta)] as const

/** Remap a petal's U to its angular slot so one texture wraps the whole sphere. */
function petalSphere(r: number, phiStart: number, phiLen: number, w: number, h: number) {
  const geo = new SphereGeometry(r, w, h, phiStart, phiLen, 0, Math.PI)
  const uv = geo.attributes['uv']!
  for (let k = 0; k < uv.count; k++) uv.setX(k, (phiStart + uv.getX(k) * phiLen) / (Math.PI * 2))
  uv.needsUpdate = true
  return geo
}

/** Thin strips closing both broken edges of a petal (between outer and inner radius). */
function rimGeometry(rOut: number, rIn: number, phiStart: number, phiLen: number, segs: number) {
  const pos: number[] = []
  const nor: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  ;[phiStart, phiStart + phiLen].forEach((phi, e) => {
    const sign = e === 0 ? -1 : 1
    const n = [sign * Math.sin(phi), 0, sign * Math.cos(phi)]
    const base = pos.length / 3
    for (let j = 0; j <= segs; j++) {
      const theta = (j / segs) * Math.PI
      pos.push(...spherePoint(rOut, phi, theta), ...spherePoint(rIn, phi, theta))
      nor.push(...n, ...n)
      uv.push(j / segs, 0, j / segs, 1)
      if (j < segs) {
        const a = base + j * 2
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
    }
  })
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  geo.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3))
  geo.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2))
  geo.setIndex(idx)
  return geo
}

class ShellLayer {
  readonly group = new Group()
  private petals: Petal[] = []
  private cfg: LayerConfig

  constructor(cfg: LayerConfig, mats: LayerMaterials, detail: { w: number; h: number }) {
    this.cfg = cfg
    const n = SHELL.petals
    const seg = (Math.PI * 2) / n
    const rIn = cfg.radius - cfg.thickness
    for (let i = 0; i < n; i++) {
      const phiStart = (i + cfg.phase) * seg + cfg.gap / 2
      const phiLen = seg - cfg.gap

      const outer = petalSphere(cfg.radius, phiStart, phiLen, detail.w, detail.h)
      const inner = petalSphere(rIn, phiStart, phiLen, detail.w, detail.h)
      const rim = rimGeometry(cfg.radius, rIn, phiStart, phiLen, detail.h)
      // Pivot on the bottom pole of the outer surface.
      for (const g of [outer, inner, rim]) g.translate(0, cfg.radius, 0)

      const pivot = new Group()
      pivot.position.set(0, -cfg.radius, 0)
      pivot.add(new Mesh(outer, mats.outside), new Mesh(inner, mats.inside), new Mesh(rim, mats.rim))

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

  /** Returns true once every petal has come to rest (used to throttle idle frames). */
  update(open: number, dt: number, reducedMotion: boolean): boolean {
    let settled = true
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
      if (Math.abs(target - pt.angle) > 0.0005 || Math.abs(pt.vel) > 0.0005) settled = false
      pt.pivot.quaternion.setFromAxisAngle(pt.axis, pt.angle)
    }
    return settled
  }
}

export class Shell {
  readonly group = new Group()
  private outer: ShellLayer
  private inner: ShellLayer
  private enamel: MeshStandardMaterial
  private ceramic: MeshStandardMaterial
  private textures: Texture[] = []

  constructor(isMobile: boolean) {
    const texW = isMobile ? 1024 : 2048
    const texH = isMobile ? 512 : 1024
    const relief = makeReliefTexture(isMobile ? 256 : 512)
    relief.repeat.set(6, 3)
    const sky = makeCelestialTextures(texW, texH, { count: SHELL.petals, phase: SHELL_LAYERS.outer.phase, gap: SHELL_LAYERS.outer.gap })
    const kin = makeKintsugiTextures(texW, texH)
    this.textures.push(relief, sky.map, sky.ormMap, sky.emissiveMap, kin.map, kin.ormMap, kin.emissiveMap)

    // Outer face: night enamel + gold inlay. Desktop gets a clear lacquer coat (crisp highlights).
    const enamelParams = {
      map: sky.map,
      roughnessMap: sky.ormMap,
      metalnessMap: sky.ormMap,
      roughness: 1,
      metalness: 1,
      emissiveMap: sky.emissiveMap,
      emissive: 0xffffff,
      emissiveIntensity: 1.1,
      bumpMap: relief,
      bumpScale: 0.35,
      envMapIntensity: 1,
      side: FrontSide,
    }
    this.enamel = isMobile
      ? new MeshStandardMaterial(enamelParams)
      : new MeshPhysicalMaterial({ ...enamelParams, clearcoat: 1, clearcoatRoughness: 0.14 })

    // Inside of the sky shell: hand-beaten gold leaf.
    const gilded = new MeshStandardMaterial({
      color: 0xf2d6a2,
      metalness: 0.85,
      roughness: 0.34,
      bumpMap: relief,
      bumpScale: 0.9,
      emissive: 0x3a2410,
      emissiveIntensity: 0.3,
      side: BackSide,
    })
    // Rims of the sky shell: solid polished gold edge.
    const goldRim = new MeshStandardMaterial({ color: 0xd9a85a, metalness: 1, roughness: 0.3, side: DoubleSide })

    // Inner layer: matte raku ceramic with gold kintsugi veins that glow as Solar wakes.
    this.ceramic = new MeshStandardMaterial({
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
    const pearl = isMobile
      ? new MeshStandardMaterial({ color: 0xf3dccf, roughness: 0.3, metalness: 0.15, emissive: 0x3a2014, emissiveIntensity: 0.4, side: BackSide })
      : new MeshPhysicalMaterial({
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
    // Broken edge of fired clay: unglazed biscuit, warm and rough.
    const biscuit = new MeshStandardMaterial({
      color: 0xcdb49a,
      roughness: 0.95,
      metalness: 0,
      bumpMap: relief,
      bumpScale: 1.5,
      side: DoubleSide,
    })

    const detail = { w: isMobile ? 10 : 14, h: isMobile ? 28 : 40 }
    this.outer = new ShellLayer(SHELL_LAYERS.outer, { outside: this.enamel, inside: gilded, rim: goldRim }, detail)
    this.inner = new ShellLayer(SHELL_LAYERS.inner, { outside: this.ceramic, inside: pearl, rim: biscuit }, detail)
    this.group.add(this.outer.group, this.inner.group)
  }

  /** Returns true when both layers are at rest. */
  update(o: { openOuter: number; openInner: number; glow: number; stars: number; progress: number; dt: number; reducedMotion: boolean }): boolean {
    const a = this.outer.update(o.openOuter, o.dt, o.reducedMotion)
    const b = this.inner.update(o.openInner, o.dt, o.reducedMotion)
    this.enamel.emissiveIntensity = o.stars
    // Kintsugi veins: faint ember while sealed, bright gold once Solar shines.
    this.ceramic.emissiveIntensity = 0.2 + o.glow * 1.8
    this.group.rotation.y = o.progress * Math.PI * 0.5
    return a && b
  }

  dispose() {
    this.textures.forEach((t) => t.dispose())
  }
}
