// Small math helpers shared by the 3D scene and the DOM scroll director.

export type Rgb = [number, number, number]
export type Key = readonly [number, number]
export type ColorKey = readonly [number, number]
export type VecKey = readonly [number, readonly [number, number, number]]

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}
/** 0..1 position of p inside [a, b], clamped. */
export const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a))

/**
 * Monotone cubic interpolation through keys (Fritsch–Carlson): velocity is continuous through
 * every keyframe (no stop-and-go), and values never overshoot between keys.
 */
const tangentCache = new WeakMap<readonly (readonly [number, number])[], number[]>()

function monotoneTangents(keys: readonly (readonly [number, number])[]): number[] {
  const cached = tangentCache.get(keys)
  if (cached) return cached
  const n = keys.length
  const d: number[] = []
  for (let k = 0; k < n - 1; k++) d.push((keys[k + 1]![1] - keys[k]![1]) / (keys[k + 1]![0] - keys[k]![0]))
  const m: number[] = new Array(n).fill(0)
  for (let k = 1; k < n - 1; k++) {
    const a = d[k - 1]!
    const b = d[k]!
    m[k] = a * b <= 0 ? 0 : (a + b) / 2
  }
  // Ends ease in/out (zero slope) so motion starts and settles softly.
  for (let k = 0; k < n - 1; k++) {
    const dk = d[k]!
    if (dk === 0) {
      m[k] = 0
      m[k + 1] = 0
      continue
    }
    const a = m[k]! / dk
    const b = m[k + 1]! / dk
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[k] = t * a * dk
      m[k + 1] = t * b * dk
    }
  }
  tangentCache.set(keys, m)
  return m
}

function monotone(p: number, keys: readonly (readonly [number, number])[], values?: (k: number) => number, tangents?: number[]): number {
  const n = keys.length
  const val = values ?? ((k: number) => keys[k]![1])
  if (p <= keys[0]![0]) return val(0)
  if (p >= keys[n - 1]![0]) return val(n - 1)
  let i = 0
  while (i < n - 2 && p > keys[i + 1]![0]) i++
  const t0 = keys[i]![0]
  const h = keys[i + 1]![0] - t0
  const s = (p - t0) / h
  const s2 = s * s
  const s3 = s2 * s
  const m = tangents ?? monotoneTangents(keys)
  return (2 * s3 - 3 * s2 + 1) * val(i) + (s3 - 2 * s2 + s) * h * m[i]! + (-2 * s3 + 3 * s2) * val(i + 1) + (s3 - s2) * h * m[i + 1]!
}

/** Smooth, continuous interpolation through keys. */
export function keyed(p: number, keys: readonly Key[]): number {
  return monotone(p, keys)
}

/** Piecewise linear interpolation (motion continues through keys). */
export function keyedLinear(p: number, keys: readonly Key[]): number {
  const first = keys[0]!
  if (p <= first[0]) return first[1]
  for (let i = 1; i < keys.length; i++) {
    const k0 = keys[i - 1]!
    const k1 = keys[i]!
    if (p <= k1[0]) return lerp(k0[1], k1[1], (p - k0[0]) / (k1[0] - k0[0]))
  }
  return keys[keys.length - 1]![1]
}

/** Cubic Hermite spline through keys (non-uniform Catmull-Rom tangents) for a continuous camera path. */
function splineComponent(p: number, times: number[], vals: number[]): number {
  const n = times.length
  if (p <= times[0]!) return vals[0]!
  if (p >= times[n - 1]!) return vals[n - 1]!
  let i = 0
  while (i < n - 2 && p > times[i + 1]!) i++
  const t0 = times[i]!
  const t1 = times[i + 1]!
  const v0 = vals[i]!
  const v1 = vals[i + 1]!
  const tangent = (k: number) => {
    if (k <= 0 || k >= n - 1) return 0
    return (vals[k + 1]! - vals[k - 1]!) / (times[k + 1]! - times[k - 1]!)
  }
  const h = t1 - t0
  const m0 = tangent(i) * h
  const m1 = tangent(i + 1) * h
  const s = (p - t0) / h
  const s2 = s * s
  const s3 = s2 * s
  return (2 * s3 - 3 * s2 + 1) * v0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * v1 + (s3 - s2) * m1
}

export function keyedSpline(p: number, keys: readonly VecKey[], out: [number, number, number]) {
  const times = keys.map((k) => k[0])
  for (let c = 0; c < 3; c++) {
    out[c] = splineComponent(
      p,
      times,
      keys.map((k) => k[1][c]!),
    )
  }
  return out
}

export const hexToRgb = (hex: number): Rgb => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255]

const channelCache = new WeakMap<readonly ColorKey[], [Key[], Key[], Key[]]>()

/** Sky/mote colors: per-channel monotone interpolation, so the dawn never pauses at a keyframe. */
export function keyedColor(p: number, keys: readonly ColorKey[], out: Rgb): Rgb {
  let ch = channelCache.get(keys)
  if (!ch) {
    const rgb = keys.map((k) => [k[0], hexToRgb(k[1])] as const)
    ch = [0, 1, 2].map((c) => rgb.map(([t, v]) => [t, v[c]!] as Key)) as [Key[], Key[], Key[]]
    channelCache.set(keys, ch)
  }
  out[0] = clamp(monotone(p, ch[0]))
  out[1] = clamp(monotone(p, ch[1]))
  out[2] = clamp(monotone(p, ch[2]))
  return out
}

/** Frame-rate independent exponential approach. */
export const damp = (current: number, target: number, rate: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-rate * dt))
