import type { InjectionKey, Ref } from 'vue'
import { FLAVORS } from '~~/shared/flavors'

type Lens  = 'classic' | 'surprising'
type Phase = 'results' | 'empty'

export type LiveMatch = { name: string; pct: number; axis: 'g' | 'a' | 'r'; why: string; note: string }
export type LiveGenome = { label: string; classic: LiveMatch[]; surprising: LiveMatch[] }

export type MingoController = {
  seedKey:  Ref<string>
  lens:     Ref<Lens>
  sel:      Ref<string | null>
  mSel:     Ref<string | null>
  phase:    Ref<Phase>
  explores: Ref<number>
  notice:   Ref<string | null>
  share:    Ref<{ seedKey: string; lens: Lens } | null>
  genome:   Ref<LiveGenome | null>
  pickSeed:     (key: string, note?: string) => void
  swapLens:     (v: Lens) => void
  openShare:    () => void
  closeShare:   () => void
  clearNotice:  () => void
  replay:       () => void
  _syncFromRoute: (key: string, lensParam?: string) => void
  _setGenome:   (key: string, data: LiveGenome) => void
}

const MINGO_KEY: InjectionKey<MingoController> = Symbol('mingo')

function createMingo(): MingoController {
  const seedKey  = ref('fig')
  const lens     = ref<Lens>('surprising')
  const sel      = ref<string | null>(null)
  const mSel     = ref<string | null>(null)
  const phase    = ref<Phase>('empty')
  const explores = ref(0)
  const notice   = ref<string | null>(null)
  const share    = ref<{ seedKey: string; lens: Lens } | null>(null)
  const genome   = ref<LiveGenome | null>(null)
  const router   = useRouter()

  function pickSeed(key: string, note?: string) {
    seedKey.value  = key
    sel.value      = null
    mSel.value     = null
    notice.value   = note ?? null
    phase.value    = 'results'
    genome.value   = null        // clear stale genome until API responds
    explores.value++
    track('seed_explored', { seed: key, lens: lens.value })
    navigateTo(`/genome/${key}`)
  }

  function swapLens(v: Lens) {
    lens.value = v
    sel.value  = null
    track('lens_swapped', { lens: v })
    router.replace({ query: { lens: v } })
  }

  function openShare() {
    share.value = { seedKey: seedKey.value, lens: lens.value }
    track('share_opened', { seed: seedKey.value, lens: lens.value })
  }

  function closeShare() { share.value = null }
  function clearNotice() { notice.value = null }

  function replay() {
    phase.value    = 'empty'
    explores.value = 0
    notice.value   = null
    sel.value      = null
    mSel.value     = null
    navigateTo('/')
  }

  function _syncFromRoute(key: string, lensParam?: string) {
    seedKey.value = key
    if (lensParam === 'classic' || lensParam === 'surprising') lens.value = lensParam
    phase.value    = 'results'
    explores.value = Math.max(explores.value, 1)
  }

  function _setGenome(key: string, data: LiveGenome) {
    if (key === seedKey.value) genome.value = data
  }

  return { seedKey, lens, sel, mSel, phase, explores, notice, share, genome,
    pickSeed, swapLens, openShare, closeShare, clearNotice, replay, _syncFromRoute, _setGenome }
}

export function provideMingo(): MingoController {
  const mingo = createMingo()
  provide(MINGO_KEY, mingo)
  return mingo
}

export function useMingo(): MingoController {
  return inject(MINGO_KEY)!
}
