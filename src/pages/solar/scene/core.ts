// Solar itself: plasma core, additive corona and the warm point light that lights the pearl petals.
import { AdditiveBlending, Color, Group, Mesh, PlaneGeometry, PointLight, ShaderMaterial, SphereGeometry, type Camera } from 'three'
import { range, smooth } from '../sceneMath'
import { coreFragment, coreVertex, coronaFragment, coronaVertex, leakFragment } from './shaders'

export class SolarCore {
  readonly group = new Group()
  private core: Mesh
  private coreMat: ShaderMaterial
  private corona: Mesh
  private coronaMat: ShaderMaterial
  private leak: Mesh
  private leakMat: ShaderMaterial
  private light = new PointLight(0xffc27a, 1, 0, 2)
  private emberColor = new Color(0xff6a2a)
  private dayColor = new Color(0xffe2b8)

  constructor(isMobile: boolean) {
    // Fewer noise octaves on phones: same look at a glance, far cheaper per pixel.
    const defines = { OCT: isMobile ? 3 : 4 }
    this.coreMat = new ShaderMaterial({
      vertexShader: coreVertex,
      fragmentShader: coreFragment,
      defines,
      uniforms: { uTime: { value: 0 }, uGlow: { value: 0 } },
    })
    this.core = new Mesh(new SphereGeometry(1, isMobile ? 48 : 64, isMobile ? 32 : 48), this.coreMat)
    this.coronaMat = new ShaderMaterial({
      vertexShader: coronaVertex,
      fragmentShader: coronaFragment,
      defines: { OCT: isMobile ? 2 : 3 },
      uniforms: { uTime: { value: 0 }, uStrength: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      toneMapped: false,
    })
    this.corona = new Mesh(new PlaneGeometry(7.5, 7.5), this.coronaMat)
    this.leakMat = new ShaderMaterial({
      vertexShader: coronaVertex,
      fragmentShader: leakFragment,
      uniforms: { uTime: { value: 0 }, uStrength: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      toneMapped: false,
    })
    this.leak = new Mesh(new PlaneGeometry(7.5, 7.5), this.leakMat)
    this.group.add(this.core, this.corona, this.leak, this.light)
  }

  update(o: { glow: number; open: number; leak: number; spin: number; spinBoost: number; time: number; dt: number; reducedMotion: boolean; camera: Camera }) {
    // Solar rises out of the opening bud.
    this.group.position.y = o.open * 0.55
    this.coreMat.uniforms['uGlow']!.value = o.glow
    this.coreMat.uniforms['uTime']!.value = o.time
    if (!o.reducedMotion) this.core.rotation.y += (o.spin + o.spinBoost * 1.6 * Math.max(o.spin, 0.15)) * o.dt
    this.core.scale.setScalar(1 + Math.sin(o.time * 1.2) * 0.012 * o.glow)
    this.coronaMat.uniforms['uTime']!.value = o.time
    this.coronaMat.uniforms['uStrength']!.value = smooth(range(o.glow, 0.25, 1)) * 1.15
    this.corona.visible = o.glow > 0.25
    this.corona.quaternion.copy(o.camera.quaternion)
    this.leakMat.uniforms['uTime']!.value = o.time
    this.leakMat.uniforms['uStrength']!.value = o.leak
    this.leak.visible = o.leak > 0.005
    // Rays slowly turn, so the light feels alive rather than painted on.
    this.leak.quaternion.copy(o.camera.quaternion)
    this.leak.rotateZ(o.time * 0.03)
    this.light.intensity = 0.4 + o.glow * 14
    // Ember-red while sealed, warm white-gold once open.
    this.light.color.copy(this.emberColor).lerp(this.dayColor, smooth(o.glow))
  }
}
