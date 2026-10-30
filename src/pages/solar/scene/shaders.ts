// GLSL for the Solar core, its corona, the light-leak rays, the sky backdrop and floating motes.
// OCT (noise octaves) is lowered on phones via material defines to keep fragment cost down.

const NOISE = /* glsl */ `
#ifndef OCT
#define OCT 4
#endif
float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i + vec3(0.0, 0.0, 0.0)), hash3(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < OCT; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}
// Ridged noise: bright cell walls with darker centres — reads as solar granulation.
float ridged(vec3 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < OCT - 1; i++) {
    float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
    v += a * n * n;
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}
`

export const coreVertex = /* glsl */ `
varying vec3 vPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
void main() {
  vPos = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

/**
 * A believable star: domain-warped convection, boiling granulation, faculae near the limb,
 * limb darkening, a thin chromosphere rim and a blackbody-like colour ramp
 * (sealed: dim ember → open: white-gold).
 */
export const coreFragment = /* glsl */ `
uniform float uTime;
uniform float uGlow;
varying vec3 vPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
${NOISE}
void main() {
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(vViewDir);
  float mu = clamp(dot(n, v), 0.0, 1.0);

  // Large convection cells, gently domain-warped so they flow instead of scrolling.
  vec3 q = vPos * 2.0 + vec3(0.0, uTime * 0.035, 0.0);
  float warp = fbm(q * 1.3 + vec3(uTime * 0.02));
  float large = fbm(q + warp * 0.9);
  // Fine boiling granulation.
  float gran = ridged(vPos * 11.0 + vec3(uTime * 0.11, -uTime * 0.07, uTime * 0.05));

  float heat = large * 0.7 + gran * 0.42;
  // Faculae: bright patches that show best near the limb.
  heat += smoothstep(0.55, 0.85, large) * (1.0 - mu) * 0.35;

  // Blackbody-like ramp: ember → orange → gold → white-gold.
  float t = clamp(heat * mix(0.7, 1.12, uGlow), 0.0, 1.0);
  vec3 c1 = vec3(0.45, 0.06, 0.02);
  vec3 c2 = vec3(1.0, 0.36, 0.06);
  vec3 c3 = vec3(1.0, 0.7, 0.26);
  vec3 c4 = vec3(1.0, 0.95, 0.82);
  vec3 col = mix(c1, c2, smoothstep(0.0, 0.42, t));
  col = mix(col, c3, smoothstep(0.38, 0.72, t));
  col = mix(col, c4, smoothstep(0.7, 1.0, t) * (0.35 + 0.65 * uGlow));

  // Limb darkening (a real star is dimmer and redder at its edge) + thin chromosphere.
  col *= 0.38 + 0.62 * pow(mu, 0.55);
  col += vec3(1.0, 0.42, 0.14) * pow(1.0 - mu, 6.0) * (0.35 + 0.9 * uGlow);

  // Calm heartbeat while sealed, fading out as it opens.
  float beat = pow(0.5 + 0.5 * sin(uTime * 2.513), 4.0);
  float pulse = 1.0 + beat * 0.5 * (1.0 - uGlow);
  float intensity = mix(1.0, 3.3, uGlow) * pulse;

  gl_FragColor = vec4(col * intensity, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export const coronaVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/** Corona: tight bright halo + wide soft bloom + slowly evolving streamers (no regular "sun rays"). */
export const coronaFragment = /* glsl */ `
uniform float uTime;
uniform float uStrength;
varying vec2 vUv;
${NOISE}
void main() {
  vec2 c = vUv - 0.5;
  float r = length(c) * 2.0;
  if (r > 1.0) discard; // skip the plane's empty corners
  float a = atan(c.y, c.x);
  vec2 dir = vec2(cos(a), sin(a));
  float d = max(r - 0.27, 0.0);

  float s1 = fbm(vec3(dir * 2.2, uTime * 0.025));
  float s2 = vnoise(vec3(dir * 7.0, uTime * 0.04 + r * 0.8));
  float streamers = pow(s1, 3.0) * 1.7 + pow(s2, 4.0) * 0.6;

  float halo = exp(-d * 7.0);
  float bloom = exp(-d * 2.2) * 0.32;
  float rays = streamers * exp(-d * 2.4);
  float m = (halo * 0.95 + bloom + rays) * smoothstep(1.0, 0.7, r);
  vec3 col = mix(vec3(1.0, 0.55, 0.22), vec3(1.0, 0.93, 0.78), halo);
  float breath = 0.92 + 0.08 * sin(uTime * 0.7);
  gl_FragColor = vec4(col * m * uStrength * breath, 1.0);
}
`

export const skyVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`

// Thin god-rays escaping through the cracks while the shell is still mostly sealed.
export const leakFragment = /* glsl */ `
uniform float uTime;
uniform float uStrength;
varying vec2 vUv;
float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
void main() {
  vec2 c = vUv - 0.5;
  float r = length(c) * 2.0;
  if (r > 1.0) discard;
  float a = atan(c.y, c.x) / 6.28318 + 0.5;
  // 36 angular slots, each with its own width, length and flicker.
  float slot = floor(a * 36.0);
  float f = fract(a * 36.0);
  float seed = h1(slot);
  float width = mix(0.04, 0.16, h1(slot + 7.0));
  float beam = smoothstep(width, 0.0, abs(f - 0.5));
  float len = mix(0.55, 1.0, seed);
  float radial = smoothstep(0.3, 0.37, r) * smoothstep(len, 0.36, r);
  float flicker = 0.55 + 0.45 * sin(uTime * (0.6 + seed) + seed * 40.0);
  float m = beam * radial * flicker * step(0.35, seed);
  vec3 col = mix(vec3(1.0, 0.62, 0.28), vec3(1.0, 0.9, 0.7), beam);
  gl_FragColor = vec4(col * m * uStrength, 1.0);
}
`

export const skyFragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uBottom;
uniform vec2 uSun;
uniform float uSunStrength;
uniform float uAspect;
varying vec2 vUv;
float h2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 col = mix(uBottom, uMid, smoothstep(0.0, 0.5, vUv.y));
  col = mix(col, uTop, smoothstep(0.45, 1.0, vUv.y));
  vec2 d = (vUv - uSun) * vec2(uAspect, 1.0);
  float dist = length(d);
  col += vec3(1.0, 0.78, 0.5) * exp(-dist * 2.6) * uSunStrength;
  col += (h2(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`

export const moteVertex = /* glsl */ `
attribute float aSize;
attribute float aSeed;
uniform float uTime;
uniform float uPixelRatio;
uniform float uStretch;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * 0.18 * (0.4 + aSeed) + 10.0, 20.0) - 10.0;
  p.x += sin(uTime * 0.3 + aSeed * 6.2831) * 0.35;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uPixelRatio * (9.0 / -mv.z) * (1.0 + uStretch);
  gl_Position = projectionMatrix * mv;
  vAlpha = 0.35 + 0.65 * aSeed;
}
`

export const moteFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uStretch;
varying float vAlpha;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  q.y *= 1.0 + uStretch * 1.5;
  float d = length(q);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor * a * vAlpha * uOpacity, 1.0);
}
`
