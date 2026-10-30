// Generative ambient pad (Web Audio, no files): muffled and minor at night, opening into a
// bright major chord as Solar wakes. Off by default; starts only on a user gesture.
import { clamp } from './sceneMath'

const NIGHT = [110, 164.81, 246.94, 261.63] // A2 E3 B3 C4  — Am(add9)
const DAWN = [110, 164.81, 246.94, 277.18] //  A2 E3 B3 C#4 — A(add9)

export class AmbientSound {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private oscs: OscillatorNode[] = []
  private shimmerGain: GainNode | null = null
  private progress = 0
  private onVisibility = () => {
    if (!this.ctx) return
    if (document.hidden) void this.ctx.suspend()
    else void this.ctx.resume()
  }

  get running() {
    return this.ctx !== null
  }

  start() {
    if (this.ctx) return
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 0.7
    filter.connect(master)

    // Slow breathing on the filter.
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.07
    lfoGain.gain.value = 180
    lfo.connect(lfoGain).connect(filter.frequency)
    lfo.start()

    NIGHT.forEach((f, i) => {
      for (const detune of [-6, 6]) {
        const o = ctx.createOscillator()
        o.type = i === 0 ? 'sine' : 'triangle'
        o.frequency.value = f
        o.detune.value = detune
        const g = ctx.createGain()
        g.gain.value = i === 0 ? 0.32 : 0.14
        o.connect(g).connect(filter)
        o.start()
        this.oscs.push(o)
      }
    })

    // Airy shimmer that appears with the light.
    const shimmer = ctx.createOscillator()
    shimmer.type = 'sine'
    shimmer.frequency.value = 1318.5 // E6
    const shimmerGain = ctx.createGain()
    shimmerGain.gain.value = 0
    shimmer.connect(shimmerGain).connect(master)
    shimmer.start()

    this.ctx = ctx
    this.master = master
    this.filter = filter
    this.shimmerGain = shimmerGain
    master.gain.setTargetAtTime(0.06, ctx.currentTime, 1.2)
    this.apply(true)
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  stop() {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.4)
    document.removeEventListener('visibilitychange', this.onVisibility)
    window.setTimeout(() => void ctx.close(), 1500)
    this.ctx = null
    this.master = null
    this.filter = null
    this.shimmerGain = null
    this.oscs = []
  }

  setProgress(p: number) {
    this.progress = clamp(p)
    this.apply(false)
  }

  private apply(immediate: boolean) {
    const ctx = this.ctx
    if (!ctx || !this.filter || !this.shimmerGain) return
    const p = this.progress
    const t = ctx.currentTime
    const tc = immediate ? 0.01 : 0.6
    this.filter.frequency.setTargetAtTime(280 + p * p * 2600, t, tc)
    this.shimmerGain.gain.setTargetAtTime(clamp((p - 0.55) / 0.3) * 0.012, t, tc)
    // Minor → major as the sky turns to morning (the 4th voice glides C → C#).
    const chord = p > 0.6 ? DAWN : NIGHT
    this.oscs.forEach((o, k) => o.frequency.setTargetAtTime(chord[Math.floor(k / 2)]!, t, 1.5))
  }
}
