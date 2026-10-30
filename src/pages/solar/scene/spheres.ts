// "Небесный хрусталь": seven nested crystal spheres around the shell, each drawn as two crossed
// hairline orbits in a colour of the rainbow, with a small bead — the sphere's gate.
// As the visitor scrolls, the camera passes through them: each sphere flares softly and dissolves,
// outermost (the Moon's gate) first, innermost last — the journey to Solar.
// Cost: 14 line loops + 7 tiny beads, all unlit additive materials.
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from 'three'
import { range } from '../sceneMath'

/** Index 0 is the outermost sphere (the Moon's gate, cool violet); the innermost, nearest Solar, is warm. */
export const SPHERE_COLORS = ['#c4a8f0', '#8f9cf0', '#8cc8f0', '#8fe3c8', '#ffd27a', '#ffb547', '#ff8f7a'] as const

const SEGMENTS = 160

function circle(r: number): BufferGeometry {
  const pts: number[] = []
  for (let i = 0; i < SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2
    pts.push(Math.cos(a) * r, 0, Math.sin(a) * r)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pts, 3))
  return g
}

interface CrystalSphere {
  group: Group
  mats: LineBasicMaterial[]
  bead: Mesh
  beadMat: MeshBasicMaterial
  radius: number
  speed: number
  phase: number
}

export class CrystalSpheres {
  readonly group = new Group()
  private spheres: CrystalSphere[] = []
  private beadGeo = new SphereGeometry(1, 10, 8)

  constructor() {
    for (let i = 0; i < 7; i++) {
      const radius = 2.75 - i * 0.19
      const color = SPHERE_COLORS[i]!
      const g = new Group()
      // Each sphere gets its own tilt so the seven read as a crystal astrolabe, not stacked rings.
      g.rotation.set(0.35 + i * 0.21, i * 0.9, 0.12 * (i % 2 ? 1 : -1))
      const mats: LineBasicMaterial[] = []
      for (let k = 0; k < 2; k++) {
        const mat = new LineBasicMaterial({ color, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false })
        const line = new LineLoop(circle(radius), mat)
        if (k === 1) line.rotation.set(Math.PI / 2, 0, 0.4)
        line.frustumCulled = false
        g.add(line)
        mats.push(mat)
      }
      const beadMat = new MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false })
      const bead = new Mesh(this.beadGeo, beadMat)
      bead.scale.setScalar(0.035 + (6 - i) * 0.003)
      g.add(bead)
      this.group.add(g)
      this.spheres.push({ group: g, mats, bead, beadMat, radius, speed: 0.05 + i * 0.012, phase: i * 1.7 })
    }
  }

  update(progress: number, time: number, reducedMotion: boolean) {
    this.spheres.forEach((s, i) => {
      // Passage window for sphere i: outermost dissolves first, innermost last.
      const pass = range(progress, 0.1 + i * 0.075, 0.2 + i * 0.075)
      const flare = Math.sin(Math.PI * pass) // brief brightening as we pass through
      const alpha = (1 - pass) * 0.3 + flare * 0.45
      s.group.visible = alpha > 0.003
      if (!s.group.visible) return
      for (const m of s.mats) m.opacity = alpha
      s.beadMat.opacity = Math.min(1, alpha * 2.4)
      const t = reducedMotion ? 0 : time
      s.group.rotation.y = i * 0.9 + t * s.speed * (i % 2 ? 1 : -1)
      const a = s.phase + t * s.speed * 3
      s.bead.position.set(Math.cos(a) * s.radius, 0, Math.sin(a) * s.radius)
      // Spheres expand slightly as we pass, so the camera seems to move through them.
      s.group.scale.setScalar(1 + pass * 0.35)
    })
  }
}
