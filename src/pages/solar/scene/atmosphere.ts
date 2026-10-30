// Atmosphere: full-screen gradient sky (with sun glow that tracks Solar) and floating light motes.
import { AdditiveBlending, BufferAttribute, BufferGeometry, Mesh, PlaneGeometry, Points, ShaderMaterial, Vector2, Vector3 } from 'three'
import { keyed, keyedColor, type Rgb } from '../sceneMath'
import { MOTE_COLOR, MOTE_OPACITY, SKY_BOTTOM, SKY_MID, SKY_TOP } from './choreography'
import { moteFragment, moteVertex, skyFragment, skyVertex } from './shaders'

export class Atmosphere {
  readonly sky: Mesh
  readonly motes: Points
  private skyMat: ShaderMaterial
  private moteMat: ShaderMaterial
  private rgb: Rgb = [0, 0, 0]

  constructor(isMobile: boolean, pixelRatio: number) {
    this.skyMat = new ShaderMaterial({
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      uniforms: {
        uTop: { value: new Vector3() },
        uMid: { value: new Vector3() },
        uBottom: { value: new Vector3() },
        uSun: { value: new Vector2(0.5, 0.5) },
        uSunStrength: { value: 0 },
        uAspect: { value: 1 },
      },
    })
    this.sky = new Mesh(new PlaneGeometry(2, 2), this.skyMat)
    this.sky.frustumCulled = false
    this.sky.renderOrder = -1

    const count = isMobile ? 220 : 520
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = -8 + Math.random() * 11
      size[i] = 2 + Math.random() * 5
      seed[i] = Math.random()
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    geo.setAttribute('aSize', new BufferAttribute(size, 1))
    geo.setAttribute('aSeed', new BufferAttribute(seed, 1))
    this.moteMat = new ShaderMaterial({
      vertexShader: moteVertex,
      fragmentShader: moteFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      toneMapped: false,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uColor: { value: new Vector3(1, 0.7, 0.3) },
        uOpacity: { value: 0.5 },
        uStretch: { value: 0 },
      },
    })
    this.motes = new Points(geo, this.moteMat)
    this.motes.frustumCulled = false
  }

  setAspect(aspect: number) {
    this.skyMat.uniforms['uAspect']!.value = aspect
  }

  setPixelRatio(pr: number) {
    this.moteMat.uniforms['uPixelRatio']!.value = pr
  }

  /** sunUv: Solar's projected screen position (0..1). */
  update(o: { progress: number; glow: number; time: number; stretch: number; sunUv: Vector2 }) {
    const u = this.skyMat.uniforms
    const p = o.progress
    ;(u['uTop']!.value as Vector3).set(...keyedColor(p, SKY_TOP, this.rgb))
    ;(u['uMid']!.value as Vector3).set(...keyedColor(p, SKY_MID, this.rgb))
    ;(u['uBottom']!.value as Vector3).set(...keyedColor(p, SKY_BOTTOM, this.rgb))
    ;(u['uSun']!.value as Vector2).copy(o.sunUv)
    u['uSunStrength']!.value = 0.04 + o.glow * 0.5

    const m = this.moteMat.uniforms
    m['uTime']!.value = o.time
    m['uStretch']!.value = o.stretch
    m['uOpacity']!.value = keyed(p, MOTE_OPACITY)
    ;(m['uColor']!.value as Vector3).set(...keyedColor(p, MOTE_COLOR, this.rgb))
  }
}
