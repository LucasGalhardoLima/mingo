import type { Seed } from '~~/shared/flavors'
import type { LiveGenome, LiveMatch } from '~/composables/useMingo'
import enData   from '~~/shared/flavors.generated.json'
import ptBRData from '~~/shared/flavors.generated.pt-BR.json'

type FlavorData = { flavors: Record<string, Seed> }

const EN_FLAVORS = (enData   as FlavorData).flavors
const PT_FLAVORS = (ptBRData as FlavorData).flavors

// Build EN → PT name map once
const enToPtName: Record<string, string> = {}
const enToPtLabel: Record<string, string> = {}
for (const key of Object.keys(EN_FLAVORS)) {
  const en = EN_FLAVORS[key]!
  const pt = PT_FLAVORS[key]
  if (!pt) continue
  enToPtLabel[en.label] = pt.label
  for (let i = 0; i < en.classic.length; i++)
    if (en.classic[i] && pt.classic[i]) enToPtName[en.classic[i]!.name] = pt.classic[i]!.name
  for (let i = 0; i < en.surprising.length; i++)
    if (en.surprising[i] && pt.surprising[i]) enToPtName[en.surprising[i]!.name] = pt.surprising[i]!.name
}

export function useLocaleFlavors(): ComputedRef<Record<string, Seed>> {
  const { locale } = useI18n()
  return computed(() =>
    locale.value.startsWith('pt') ? PT_FLAVORS : EN_FLAVORS
  )
}

export function useLocaleGenome(genome: Ref<LiveGenome | null>): ComputedRef<LiveGenome | null> {
  const { locale } = useI18n()
  return computed(() => {
    const g = genome.value
    if (!g || !locale.value.startsWith('pt')) return g
    const translateMatch = (m: LiveMatch): LiveMatch => ({ ...m, name: enToPtName[m.name] ?? m.name })
    return {
      label:      enToPtLabel[g.label] ?? g.label,
      classic:    g.classic.map(translateMatch),
      surprising: g.surprising.map(translateMatch),
    }
  })
}
