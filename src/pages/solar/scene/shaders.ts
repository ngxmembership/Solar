// GLSL for the Solar core plasma, its corona, the sky backdrop and floating light motes.

const NOISE = /* glsl */ `
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
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.03;
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

export const coreFragment = /* glsl */ `
uniform float uTime;
uniform float uGlow;
varying vec3 vPos;
varying vec3 vNormalW;
varying vec3 vViewDir;
${NOISE}
void main() {
  vec3 p = vPos * 2.2;
  float n1 = fbm(p + vec3(0.0, uTime * 0.12, uTime * 0.05));
  float n2 = fbm(p * 1.7 - vec3(uTime * 0.07));
  float plasma = smoothstep(0.25, 0.85, n1 * 0.6 + n2 * 0.5);

  vec3 deep = vec3(1.0, 0.50, 0.26);
  vec3 gold = vec3(1.0, 0.76, 0.32);
  vec3 cream = vec3(1.0, 0.95, 0.82);
  vec3 col = mix(deep, gold, plasma);
  col = mix(col, cream, smoothstep(0.62, 1.0, plasma) * (0.4 + 0.6 * uGlow));

  float fres = pow(1.0 - max(dot(normalize(vNormalW), normalize(vViewDir)), 0.0), 2.0);
  col += cream * fres * (0.25 + 0.6 * uGlow);

  // Calm heartbeat while sealed, fading out as it opens.
  float beat = pow(0.5 + 0.5 * sin(uTime * 2.513), 4.0);
  float pulse = 1.0 + beat * 0.6 * (1.0 - uGlow);
  float intensity = mix(0.85, 2.4, uGlow) * pulse;

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

export const coronaFragment = /* glsl */ `
uniform float uTime;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vec2 c = vUv - 0.5;
  float r = length(c) * 2.0;
  float a = atan(c.y, c.x);
  float rays = (0.5 + 0.5 * sin(a * 12.0 + uTime * 0.25)) * (0.5 + 0.5 * sin(a * 7.0 - uTime * 0.18 + 1.3));
  rays = pow(rays, 2.5);
  float halo = exp(-max(r - 0.27, 0.0) * 5.5);
  float ray = rays * exp(-max(r - 0.28, 0.0) * 3.2);
  float m = (halo * 0.75 + ray * 0.55) * smoothstep(1.0, 0.55, r);
  vec3 col = mix(vec3(1.0, 0.66, 0.32), vec3(1.0, 0.93, 0.76), halo);
  float breath = 0.9 + 0.1 * sin(uTime * 0.8);
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
