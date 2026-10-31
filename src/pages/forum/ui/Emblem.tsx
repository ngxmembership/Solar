// Hero emblem: Solar in the middle of the circle, every section a small light on the orbit.
import { WRITABLE_SECTIONS } from '../sections'

export function Emblem() {
  return (
    <div aria-hidden className="forum-emblem max-w-[340px] mx-auto">
      <span style={{ ['--i' as string]: '0%', ['--a' as string]: 0.14 }} />
      <span style={{ ['--i' as string]: '13%', ['--a' as string]: 0.2 }} />
      <span className="forum-emblem-dash" style={{ ['--i' as string]: '25%', ['--a' as string]: 0.3 }} />
      <span className="forum-emblem-sun" style={{ ['--i' as string]: '34%' }} />
      <div className="absolute inset-0" style={{ animation: 'forum-turn 160s linear infinite' }}>
        {WRITABLE_SECTIONS.map((s, i) => {
          const a = (i / WRITABLE_SECTIONS.length) * Math.PI * 2 - Math.PI / 2
          const r = i % 2 === 0 ? 50 : 37
          return (
            <span
              key={s.id}
              className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + Math.cos(a) * r}%`,
                top: `${50 + Math.sin(a) * r}%`,
                background: s.to,
                boxShadow: `0 0 12px 3px ${s.to}`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
