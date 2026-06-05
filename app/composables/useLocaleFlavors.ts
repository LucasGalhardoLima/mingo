import type { Seed } from '~~/shared/flavors'
import type { LiveGenome, LiveMatch } from '~/composables/useMingo'
import enData   from '~~/shared/flavors.generated.json'
import ptBRData from '~~/shared/flavors.generated.pt-BR.json'

type FlavorData = { flavors: Record<string, Seed> }

const EN_FLAVORS = (enData   as FlavorData).flavors
const PT_FLAVORS = (ptBRData as FlavorData).flavors

// Build EN → PT maps once from the parallel datasets
const enToPtName: Record<string, string>  = {}
const enToPtLabel: Record<string, string> = {}
const enToPtDesc: Record<string, string>  = {}

for (const key of Object.keys(EN_FLAVORS)) {
  const en = EN_FLAVORS[key]!
  const pt = PT_FLAVORS[key]
  if (!pt) continue
  enToPtLabel[en.label] = pt.label
  for (const lens of ['classic', 'surprising'] as const) {
    for (let i = 0; i < en[lens].length; i++) {
      const e = en[lens][i]!
      const p = pt[lens][i]!
      enToPtName[e.name] = p.name
      // Extract descriptor from "... · descriptor" pattern
      const eSep = e.why.indexOf(' · ')
      const pSep = p.why.indexOf(' · ')
      if (eSep !== -1 && pSep !== -1)
        enToPtDesc[e.why.slice(eSep + 3)] = p.why.slice(pSep + 3)
    }
  }
}

export function useLocaleFlavors(): ComputedRef<Record<string, Seed>> {
  const { locale } = useI18n()
  return computed(() =>
    locale.value.startsWith('pt') ? PT_FLAVORS : EN_FLAVORS
  )
}

// Translate "shares ~N aroma compounds · desc" / "paired in ~X recipes · desc"
function translateWhy(why: string): string {
  const sep = why.indexOf(' · ')
  if (sep === -1) return why
  const prefix = why.slice(0, sep)
  const desc   = why.slice(sep + 3)
  const descPt = enToPtDesc[desc] ?? desc
  const mShares = prefix.match(/^shares (~\d+) aroma compounds?/)
  if (mShares) return `compartilha ${mShares[1]} compostos aromáticos · ${descPt}`
  const mPaired = prefix.match(/^paired in (~[\d,]+) recipes/)
  if (mPaired) return `combinado em ${mPaired[1]!.replace(',', '.')} receitas · ${descPt}`
  return `${prefix} · ${descPt}`
}

function translateNote(note: string): string {
  return note
    .replace(/~([\d,]+) recipes/, (_, n) => `~${n.replace(',', '.')} receitas`)
    .replace(/~(\d+) compounds?/, (_, n) => `~${n} compostos`)
}

export function useLocaleGenome(genome: Ref<LiveGenome | null>): ComputedRef<LiveGenome | null> {
  const { locale } = useI18n()
  return computed(() => {
    const g = genome.value
    if (!g || !locale.value.startsWith('pt')) return g
    const translateMatch = (m: LiveMatch): LiveMatch => ({
      ...m,
      name: enToPtName[m.name] ?? m.name,
      why:  translateWhy(m.why),
      note: translateNote(m.note),
    })
    return {
      label:      enToPtLabel[g.label] ?? g.label,
      classic:    g.classic.map(translateMatch),
      surprising: g.surprising.map(translateMatch),
    }
  })
}
