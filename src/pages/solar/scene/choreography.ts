// The whole scroll "score" in one place: every value the scene animates, keyed by progress 0..1.
// Phases: 0–15 сон · 15–35 пробуждение · 35–65 рост · 65–90 сияние (полное раскрытие ~82%) · 90–100 миссия.
import type { ColorKey, Key, VecKey } from '../sceneMath'

/** Two nested layers: an outer celestial sphere and an inner kintsugi ceramic shell. */
export const SHELL_LAYERS = {
  outer: { radius: 1.32, thickness: 0.05, maxAngle: (118 * Math.PI) / 180, gap: 0.018, phase: 0.5 },
  inner: { radius: 1.16, thickness: 0.045, maxAngle: (98 * Math.PI) / 180, gap: 0.026, phase: 0 },
} as const

export const SHELL = {
  /** Seven petals — seven crystal spheres of the old sky. */
  petals: 7,
  /** Organic opening order (petal indices), not a mechanical sweep. */
  order: [0, 3, 6, 2, 5, 1, 4],
} as const

// Gradual, continuous S-curves: the shell stays sealed through the prologue, the outer "sky" loosens
// from 12%, the inner ceramic follows with a long overlap; Solar is fully open only at ~82%.
export const OPEN_OUTER: Key[] = [[0, 0], [0.12, 0], [0.7, 1], [1, 1]]
export const OPEN: Key[] = [[0, 0], [0.24, 0], [0.82, 1], [1, 1]]
/** Painted stars fade like real ones at dawn. */
export const STARS: Key[] = [[0, 1.15], [0.35, 0.9], [0.65, 0.45], [0.8, 0.25], [1, 0.15]]
export const GLOW: Key[] = [[0, 0], [0.15, 0.04], [0.35, 0.16], [0.5, 0.32], [0.65, 0.55], [0.82, 1], [1, 1]]
export const SPIN: Key[] = [[0, 0], [0.55, 0], [0.82, 1], [1, 1]]
/** God-rays through the cracks: born at awakening, handed over to the full corona as Solar opens. */
export const LEAK: Key[] = [[0, 0.08], [0.1, 0.12], [0.22, 0.95], [0.42, 0.8], [0.62, 0.25], [0.75, 0]]

export const EXPOSURE: Key[] = [[0, 0.8], [0.5, 0.95], [0.8, 1.1], [1, 1.15]]
export const ENV: Key[] = [[0, 0.12], [0.35, 0.25], [0.65, 0.6], [0.8, 0.9], [1, 1]]
export const MOON: Key[] = [[0, 1.6], [0.35, 1.2], [0.65, 0.5], [0.8, 0.2], [1, 0.1]]
export const FILL: Key[] = [[0, 0.45], [0.35, 0.35], [0.65, 0.15], [0.8, 0.05]]
export const HEMI: Key[] = [[0, 0.5], [0.35, 0.55], [0.65, 0.8], [0.9, 1.2], [1, 1.3]]

/** How far Solar is pushed aside so the content panel has room (0 = centered). */
export const FRAME: Key[] = [[0, 0], [0.1, 0], [0.2, 1], [0.86, 1], [0.93, 0], [1, 0]]
/**
 * Vertical framing as a fraction of screen height (+ = Solar higher).
 * Title on load: Solar sits low, under the title. Prologue: Solar rises, text sits beneath it.
 */
export const FRAME_Y: Key[] = [[0, -0.13], [0.015, -0.13], [0.06, 0.19], [0.11, 0.19], [0.17, 0], [1, 0]]
export const MOTE_OPACITY: Key[] = [[0, 0.45], [0.35, 0.7], [0.8, 0.9], [1, 0.6]]

export const CAM_POS: VecKey[] = [
  [0, [0, -0.8, 11.5]],
  [0.1, [0, -0.65, 11]],
  [0.2, [0.8, -0.4, 9.2]],
  [0.35, [2.4, -0.1, 7.4]],
  [0.5, [4.0, 0.6, 6.4]],
  [0.65, [4.6, 1.2, 5.8]],
  [0.8, [2.0, 2.4, 9.0]],
  [0.9, [0, 2.0, 10.5]],
  [1, [0, 0.6, 12.5]],
]
export const CAM_LOOK: VecKey[] = [
  [0, [0, 0.1, 0]],
  [0.15, [0, 0.1, 0]],
  [0.35, [0, 0.2, 0]],
  [0.5, [0, 0.4, 0]],
  [0.65, [0, 0.5, 0]],
  [0.8, [0, 0.4, 0]],
  [0.9, [0, 0.3, 0]],
  [1, [0, -1.4, 0]],
]

// Night indigo → dusk violet → peach dawn → cream morning sky.
export const SKY_TOP: ColorKey[] = [[0, 0x100c26], [0.15, 0x16123a], [0.35, 0x241a4a], [0.55, 0x4a3478], [0.68, 0x8e88c4], [0.8, 0xb9dcf2], [1, 0xcfeaf8]]
export const SKY_MID: ColorKey[] = [[0, 0x1b1638], [0.15, 0x221a45], [0.35, 0x3a2559], [0.55, 0x6b4c9a], [0.68, 0xe7b9c0], [0.8, 0xfbe6d9], [1, 0xfff6e8]]
export const SKY_BOTTOM: ColorKey[] = [[0, 0x241a3f], [0.15, 0x2e1f4c], [0.35, 0x4a2c5e], [0.55, 0xa0628a], [0.68, 0xf7b79b], [0.8, 0xffd9b8], [1, 0xffe2bf]]
export const MOTE_COLOR: ColorKey[] = [[0, 0xffb547], [0.65, 0xffd27a], [1, 0xfff1c9]]

/** Planets = games (first four). Colors are replaced by each game's color at runtime. */
export const PLANETS = [
  { color: 0x8fe3c8, radius: 0.3, orbit: 2.5, speed: 0.32, phase: 0.3 },
  { color: 0xff8f7a, radius: 0.36, orbit: 3.1, speed: 0.24, phase: 2.1 },
  { color: 0x8cc8f0, radius: 0.28, orbit: 3.7, speed: 0.19, phase: 3.9 },
  { color: 0xc4a8f0, radius: 0.33, orbit: 4.3, speed: 0.15, phase: 5.2 },
] as const
export const PLANETS_APPEAR = [0.66, 0.78] as const
