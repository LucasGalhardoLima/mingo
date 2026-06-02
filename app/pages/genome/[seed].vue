<template>
  <div>
    <OrbitSurface />
    <ListSurface />
  </div>
</template>

<script setup lang="ts">
import { FLAVORS } from '~~/shared/flavors'
import type { LiveGenome } from '~/composables/useMingo'

const route = useRoute()
const mingo = useMingo()

const seedParam = route.params.seed as string
const lensParam = route.query.lens as string | undefined
mingo._syncFromRoute(seedParam, lensParam)

// Fetch live pairings from the Epicure API
const { data: apiGenome } = await useFetch<LiveGenome>(`/api/genome/${seedParam}`, {
  key:   `genome-${seedParam}`,
  lazy:  true,   // don't block SSR — FLAVORS provides immediate fallback
})

// Sync API response into mingo state whenever it arrives
watch(apiGenome, g => { if (g) mingo._setGenome(seedParam, g) }, { immediate: true })

const fallbackLabel = computed(() => FLAVORS[mingo.seedKey.value]?.label ?? seedParam)
const label = computed(() => apiGenome.value?.label ?? fallbackLabel.value)

useSeoMeta({
  title:         () => `${label.value} — Mingo`,
  description:   () => `What secretly loves ${label.value}? Discover flavor pairings powered by aroma science.`,
  ogTitle:       () => `${label.value} genome — Mingo`,
  ogDescription: () => `What secretly loves ${label.value}? See the top classic & surprising pairings.`,
  twitterCard:   'summary_large_image',
})
</script>
