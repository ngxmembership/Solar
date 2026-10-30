// Game planets orbiting Solar on tilted rings; one can be highlighted from the DOM.
import { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, RingGeometry, SphereGeometry, type Vector3 } from 'three'
import { damp, range, smooth } from '../sceneMath'
import { PLANETS, PLANETS_APPEAR } from './choreography'

interface Planet {
  mesh: Mesh
  mat: MeshStandardMaterial
  ring: Mesh
  ringMat: MeshBasicMaterial
  orbit: number
  speed: number
  phase: number
  scale: number
}

export class PlanetSystem {
  readonly group = new Group()
  private planets: Planet[] = []
  private orbitTime = 0
  private count: number = PLANETS.length

  /** One planet per game (max 4), tinted with each game's color. */
  setGames(colors: string[]) {
    this.count = Math.min(colors.length, this.planets.length)
    this.planets.forEach((pl, i) => {
      const c = colors[i]
      if (!c) return
      pl.mat.color.set(c)
      pl.mat.emissive.set(c)
    })
  }

  constructor() {
    this.group.rotation.set(0.38, 0, 0.12)
    for (const cfg of PLANETS) {
      const mat = new MeshStandardMaterial({ color: cfg.color, roughness: 0.55, metalness: 0, emissive: cfg.color, emissiveIntensity: 0.25 })
      const mesh = new Mesh(new SphereGeometry(cfg.radius, 32, 24), mat)
      mesh.scale.setScalar(0.0001)
      const ringMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
      const ring = new Mesh(new RingGeometry(cfg.orbit - 0.008, cfg.orbit + 0.008, 160), ringMat)
      ring.rotation.x = -Math.PI / 2
      this.group.add(mesh, ring)
      this.planets.push({ mesh, mat, ring, ringMat, orbit: cfg.orbit, speed: cfg.speed, phase: cfg.phase, scale: 0 })
    }
  }

  update(o: { progress: number; dt: number; reducedMotion: boolean; highlight: number | null; compact: boolean; center: Vector3 }) {
    const appear = smooth(range(o.progress, PLANETS_APPEAR[0], PLANETS_APPEAR[1]))
    if (!o.reducedMotion) this.orbitTime += o.dt * appear
    this.group.position.copy(o.center)
    this.group.scale.setScalar(o.compact ? 0.62 : 1)
    this.planets.forEach((pl, i) => {
      const hi = o.highlight === i
      const target = i < this.count ? appear * (hi ? 1.45 : 1) : 0
      pl.scale = o.reducedMotion ? target : damp(pl.scale, target, 6, o.dt)
      pl.mesh.scale.setScalar(Math.max(0.0001, pl.scale))
      pl.mesh.visible = pl.scale > 0.002
      const ang = pl.phase + this.orbitTime * pl.speed + o.progress * 2.5
      pl.mesh.position.set(Math.cos(ang) * pl.orbit, 0, Math.sin(ang) * pl.orbit)
      pl.mesh.rotation.y += o.dt * 0.6
      pl.mat.emissiveIntensity = damp(pl.mat.emissiveIntensity, hi ? 0.8 : 0.25, 6, o.dt)
      pl.ringMat.opacity = i < this.count ? appear * (hi ? 0.55 : 0.22) : 0
      pl.ring.visible = appear > 0.01 && i < this.count
    })
  }
}
