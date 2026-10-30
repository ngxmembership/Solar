// Orchestrates the Solar 3D scene. Visual state is a pure function of scroll progress
// (reverse scroll restores it exactly); only decorative motion runs on time.
import {
  ACESFilmicToneMapping,
  DirectionalLight,
  HemisphereLight,
  type Material,
  type Mesh,
  PerspectiveCamera,
  PMREMGenerator,
  SRGBColorSpace,
  Scene,
  type Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { clamp, damp, keyed, keyedSpline } from '../sceneMath'
import { Atmosphere } from './atmosphere'
import { CAM_LOOK, CAM_POS, ENV, EXPOSURE, FILL, FRAME, FRAME_Y, GLOW, HEMI, LEAK, MOON, OPEN, OPEN_OUTER, SPIN, STARS } from './choreography'
import { SolarCore } from './core'
import { PlanetSystem } from './planets'
import { Shell } from './shell'

export interface SolarSceneOptions {
  isMobile: boolean
  reducedMotion: boolean
  /** Called once after the first frame is on screen (shaders compiled). */
  onReady?: () => void
}

const COMPACT_BREAKPOINT = 768

export class SolarScene {
  private canvas: HTMLCanvasElement
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(35, 1, 0.1, 100)
  private pmrem: PMREMGenerator
  private envTex: Texture
  private shell: Shell
  private core: SolarCore
  private planets = new PlanetSystem()
  private atmosphere: Atmosphere
  private moon = new DirectionalLight(0xb8a8ff, 1)
  private fill = new DirectionalLight(0xcab8ff, 0.4)
  private hemi = new HemisphereLight(0x9d8fe0, 0x2a1d3f, 0.5)

  private opts: SolarSceneOptions
  private raf = 0
  private last = 0
  private time = 0
  private target = 0
  private p = 0
  private velocity = 0
  private spinBoost = 0
  private stretch = 0
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  private highlight: number | null = null
  private w = 1
  private h = 1
  private readyFired = false
  // Adaptive quality: sample frame times and drop pixel ratio if the device struggles.
  private perf = { frames: 0, total: 0, downgrades: 0 }

  private camPos: [number, number, number] = [0, 0, 0]
  private camLook: [number, number, number] = [0, 0, 0]
  private v3 = new Vector3()
  private look = new Vector3()
  private sunUv = new Vector2()

  constructor(canvas: HTMLCanvasElement, opts: SolarSceneOptions) {
    this.canvas = canvas
    this.opts = opts
    // Throws when WebGL is unavailable; the caller shows a static fallback.
    this.renderer = new WebGLRenderer({ canvas, antialias: !opts.isMobile, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.isMobile ? 1.5 : 2))
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.toneMapping = ACESFilmicToneMapping

    this.pmrem = new PMREMGenerator(this.renderer)
    this.envTex = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environment = this.envTex

    this.atmosphere = new Atmosphere(opts.isMobile, this.renderer.getPixelRatio())
    this.shell = new Shell(opts.isMobile)
    this.core = new SolarCore(opts.isMobile)
    this.moon.position.set(-4, 5, -6)
    this.fill.position.set(3, 2, 6)
    this.scene.add(this.atmosphere.sky, this.atmosphere.motes, this.moon, this.fill, this.hemi)
    this.scene.add(this.shell.group, this.core.group, this.planets.group)

    this.resize()
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  setProgress(p: number) {
    this.target = clamp(p)
  }
  /** Scroll velocity in px/s — short spin impulse + mote stretch. */
  setVelocity(v: number) {
    this.velocity = v
  }
  setPointer(x: number, y: number) {
    this.pointer.x = x
    this.pointer.y = y
  }
  setHighlight(i: number | null) {
    this.highlight = i
  }
  setGames(colors: string[]) {
    this.planets.setGames(colors)
  }

  resize() {
    this.w = this.canvas.clientWidth || window.innerWidth
    this.h = this.canvas.clientHeight || window.innerHeight
    this.renderer.setSize(this.w, this.h, false)
    this.camera.aspect = this.w / this.h
    this.camera.updateProjectionMatrix()
    this.atmosphere.setAspect(this.w / this.h)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    const mats = new Set<Material>()
    this.scene.traverse((obj) => {
      const m = obj as Mesh
      m.geometry?.dispose()
      const mat = m.material
      if (Array.isArray(mat)) mat.forEach((x) => mats.add(x))
      else if (mat) mats.add(mat)
    })
    mats.forEach((m) => m.dispose())
    this.shell.dispose()
    this.envTex.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }

  private adaptQuality(dt: number) {
    if (this.time < 1.5 || this.perf.downgrades >= 2) return
    this.perf.frames++
    this.perf.total += dt
    if (this.perf.frames < 90) return
    const avg = this.perf.total / this.perf.frames
    this.perf.frames = 0
    this.perf.total = 0
    const pr = this.renderer.getPixelRatio()
    if (avg > 1 / 42 && pr > 1) {
      const next = Math.max(1, pr * 0.75)
      this.renderer.setPixelRatio(next)
      this.renderer.setSize(this.w, this.h, false)
      this.atmosphere.setPixelRatio(next)
      this.perf.downgrades++
    }
  }

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick)
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000))
    this.last = now
    const rm = this.opts.reducedMotion
    this.time += rm ? dt * 0.15 : dt
    this.adaptQuality(dt)

    // Mass of the scene: progress glides after the scroll with a soft, long lag (~1.2s desktop).
    this.p = rm ? this.target : damp(this.p, this.target, this.opts.isMobile ? 3.4 : 2, dt)
    if (Math.abs(this.p - this.target) < 0.00005) this.p = this.target
    const p = this.p

    // Scroll-velocity impulses decay in ~1s.
    this.spinBoost = damp(this.spinBoost, rm ? 0 : clamp(this.velocity / 2500, -1, 1), 3, dt)
    this.stretch = damp(this.stretch, rm ? 0 : Math.min(0.8, Math.abs(this.velocity) / 4000), 4, dt)
    this.velocity = damp(this.velocity, 0, 4, dt)

    const open = keyed(p, OPEN)
    const glow = keyed(p, GLOW)
    const compact = this.w < COMPACT_BREAKPOINT

    this.updateCamera(p, dt, compact)
    this.shell.update({
      openOuter: keyed(p, OPEN_OUTER),
      openInner: open,
      glow,
      stars: keyed(p, STARS),
      progress: p,
      dt,
      reducedMotion: rm,
    })
    this.core.update({ glow, open, leak: keyed(p, LEAK), spin: keyed(p, SPIN) * 0.6, spinBoost: this.spinBoost, time: this.time, dt, reducedMotion: rm, camera: this.camera })
    this.planets.update({ progress: p, dt, reducedMotion: rm, highlight: this.highlight, compact, center: this.core.group.position })

    this.renderer.toneMappingExposure = keyed(p, EXPOSURE)
    this.scene.environmentIntensity = keyed(p, ENV)
    this.moon.intensity = keyed(p, MOON)
    this.fill.intensity = keyed(p, FILL)
    this.hemi.intensity = keyed(p, HEMI)

    // Sun glow in the sky follows Solar's on-screen position.
    this.core.group.updateMatrixWorld()
    this.core.group.getWorldPosition(this.v3).project(this.camera)
    this.sunUv.set((this.v3.x + 1) / 2, (this.v3.y + 1) / 2)
    this.atmosphere.update({ progress: p, glow, time: this.time, stretch: this.stretch, sunUv: this.sunUv })

    this.renderer.render(this.scene, this.camera)
    if (!this.readyFired) {
      this.readyFired = true
      this.opts.onReady?.()
    }
  }

  private updateCamera(p: number, dt: number, compact: boolean) {
    keyedSpline(p, CAM_POS, this.camPos)
    keyedSpline(p, CAM_LOOK, this.camLook)
    const aspect = this.w / this.h
    // Portrait screens: pull back so the bud and orbits fit.
    const dist = aspect < 1 ? clamp((1 / aspect) * 0.78, 1, 1.75) : 1
    this.look.set(...this.camLook)
    this.v3.set(...this.camPos).sub(this.look).multiplyScalar(dist).add(this.look)
    if (!this.opts.isMobile && !this.opts.reducedMotion) {
      this.pointer.sx = damp(this.pointer.sx, this.pointer.x, 3, dt)
      this.pointer.sy = damp(this.pointer.sy, this.pointer.y, 3, dt)
      this.v3.x += this.pointer.sx * 0.45
      this.v3.y += this.pointer.sy * 0.3
    }
    this.camera.position.copy(this.v3)
    this.camera.lookAt(this.look)
    this.camera.updateMatrixWorld()

    // Shift the framing so Solar sits beside (desktop) or above (mobile) the content panel.
    const frame = keyed(p, FRAME)
    const frameY = keyed(p, FRAME_Y)
    const dx = compact ? 0 : frame * 0.21 * this.w
    const dy = (compact ? frame * 0.2 : 0) * this.h + frameY * this.h
    this.camera.setViewOffset(this.w, this.h, -dx, dy, this.w, this.h)
  }
}
