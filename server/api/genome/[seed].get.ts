import { getNeighbors } from '../../utils/epicure'

export default defineEventHandler(async (event) => {
  const seed = getRouterParam(event, 'seed')!

  const pairs = await getNeighbors(seed, 6)
  if (!pairs) {
    throw createError({ statusCode: 404, statusMessage: `Ingredient "${seed}" not in vocabulary` })
  }

  // Attach editorial copy from pre-generated cache if available
  const why = await useWhy(seed)

  const enrich = (matches: typeof pairs.classic, lens: 'classic' | 'surprising') =>
    matches.map((m, i) => ({
      name: m.name,
      pct:  m.pct,
      axis: m.axis,
      why:  why?.[lens]?.[i]?.why  ?? fallbackWhy(m.name, lens, m.pct),
      note: why?.[lens]?.[i]?.note ?? fallbackNote(lens, m.pct),
    }))

  return {
    label:     seed.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    classic:    enrich(pairs.classic,    'classic'),
    surprising: enrich(pairs.surprising, 'surprising'),
  }
})

// ── why-cache ─────────────────────────────────────────────────────────────────

let whyCache: Record<string, Record<string, Array<{ why: string; note: string }>>> | null = null

async function useWhy(seed: string) {
  if (!whyCache) {
    try {
      // Try to load the pre-generated flavors JSON (built by scripts/build_flavors.py)
      const { flavors } = await import('~~/shared/flavors.generated.json').catch(() => ({ flavors: {} }))
      whyCache = {}
      for (const [key, val] of Object.entries(flavors as Record<string, any>)) {
        whyCache[key] = { classic: val.classic, surprising: val.surprising }
      }
    } catch {
      whyCache = {}
    }
  }
  return whyCache[seed] ?? null
}

// ── template fallbacks (used for seeds not in pre-generated cache) ─────────────

function fallbackWhy(name: string, lens: 'classic' | 'surprising', pct: number): string {
  if (lens === 'classic') {
    const approx = pct >= 90 ? '~1,800' : pct >= 82 ? '~800' : '~300'
    return `paired in ${approx} recipes · culinary match`
  }
  const n = pct >= 90 ? '~11' : pct >= 82 ? '~8' : '~5'
  return `shares ${n} aroma compounds · flavor overlap`
}

function fallbackNote(lens: 'classic' | 'surprising', pct: number): string {
  if (lens === 'classic') {
    return pct >= 90 ? '~1,800 recipes' : pct >= 82 ? '~800 recipes' : '~300 recipes'
  }
  return pct >= 90 ? '~11 compounds' : pct >= 82 ? '~8 compounds' : '~5 compounds'
}
