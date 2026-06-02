import { FLAVORS, STAPLE_ALIASES, NO_MATCH_TERMS, FLAVOR_EDGE } from './flavors'
import type { Match, Axis } from './flavors'

export const RINGS = [100, 152, 198] as const

export type LayoutNode = Match & {
  ang: number
  r: number
  x: number
  y: number
}

export type ResolveResult =
  | { type: 'direct'; items: string[] }
  | { type: 'alias';    seed: string; from: string }
  | { type: 'no-match'; from: string; cousins: { name: string; axis: Axis }[] }
  | { type: 'oov';      from: string; items: string[] }

export function bucket(pct: number): 0 | 1 | 2 {
  return pct >= 88 ? 0 : pct >= 78 ? 1 : 2
}

export function layout(items: Match[]): LayoutNode[] {
  return items.map((n, i) => {
    const ang = 90 - i * 60
    const r   = RINGS[bucket(n.pct)]
    const t   = ang * Math.PI / 180
    return { ...n, ang, r, x: 230 + r * Math.cos(t), y: 230 - r * Math.sin(t) }
  })
}

export const norm = (s: string): string => (s || '').toLowerCase().replace(/[^a-z]/g, '')

export function seedKeyFor(name: string): string | null {
  const k = norm(name)
  return Object.keys(FLAVORS).find(key => norm(FLAVORS[key]!.label) === k) ?? null
}

export function resolveQuery(q: string): ResolveResult {
  const n    = norm(q)
  const keys = Object.keys(FLAVORS)

  const direct = keys.filter(k =>
    norm(FLAVORS[k]!.label).includes(n) || n.includes(norm(FLAVORS[k]!.label))
  )
  if (direct.length) return { type: 'direct', items: direct }

  for (const k of keys) {
    const aliases = (STAPLE_ALIASES[k] ?? []).map(norm)
    if (aliases.some(a => a.includes(n) || n.includes(a))) {
      return { type: 'alias', seed: k, from: q }
    }
  }

  if (NO_MATCH_TERMS.some(t => norm(t).includes(n) || n.includes(norm(t)))) {
    return { type: 'no-match', from: q, cousins: FLAVOR_EDGE.noMatch.cousins }
  }

  return { type: 'oov', from: q, items: keys }
}

export const fillClass: Record<Axis, string> = { g: 'fill-g', a: 'fill-a', r: 'fill-r' }
