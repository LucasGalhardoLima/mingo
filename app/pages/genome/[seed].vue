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
const { t } = useI18n()

const seedParam = route.params.seed as string
const lensParam = route.query.lens as string | undefined
mingo._syncFromRoute(seedParam, lensParam)

const { data: apiGenome } = await useFetch<LiveGenome>(`/api/genome/${seedParam}`, {
  key:   `genome-${seedParam}`,
  lazy:  true,
})

watch(apiGenome, g => { if (g) mingo._setGenome(seedParam, g) }, { immediate: true })

const fallbackLabel = computed(() => FLAVORS[mingo.seedKey.value]?.label ?? seedParam)
const label = computed(() => apiGenome.value?.label ?? fallbackLabel.value)

useSeoMeta({
  title:         () => t('seo.genome.title', { label: label.value }),
  description:   () => t('seo.genome.description', { label: label.value }),
  ogTitle:       () => t('seo.genome.ogTitle', { label: label.value }),
  ogDescription: () => t('seo.genome.ogDescription', { label: label.value }),
  twitterCard:   'summary_large_image',
})
</script>
