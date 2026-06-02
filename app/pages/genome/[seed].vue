<template>
  <div>
    <OrbitSurface />
    <ListSurface />
  </div>
</template>

<script setup lang="ts">
import { FLAVORS } from '../../../shared/flavors'

const route = useRoute()
const mingo = useMingo()

const seedParam = route.params.seed as string
const lensParam = route.query.lens as string | undefined
mingo._syncFromRoute(seedParam, lensParam)

const label = computed(() => FLAVORS[mingo.seedKey.value]?.label ?? seedParam)

useSeoMeta({
  title:          () => `${label.value} — Mingo`,
  description:    () => `What secretly loves ${label.value}? Discover flavor pairings powered by aroma science.`,
  ogTitle:        () => `${label.value} genome — Mingo`,
  ogDescription:  () => `What secretly loves ${label.value}? See the top classic & surprising pairings.`,
  twitterCard:    'summary_large_image',
})
</script>
