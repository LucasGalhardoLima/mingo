<template>
  <div
    class="stage"
    style="--stage:460px;margin:32px auto 0"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Three independent ring spinners — same pattern as OrbitSurface -->
    <div
      v-for="(ringNodes, r) in nodeGroups"
      :key="r"
      class="orbit-spinner"
      :style="{ transform: `rotate(${angles[r]}deg)` }"
    >
      <svg viewBox="0 0 460 460">
        <circle class="ring" cx="230" cy="230" :r="RINGS[r]" />
      </svg>
      <OrbitNode
        v-for="{ node, idx } in ringNodes"
        :key="`hero-${idx}`"
        :n="node"
        :i="idx"
        :angle="angles[r] ?? 0"
        :hide-pct="true"
      />
    </div>

    <!-- Center: brand copy instead of seed disc -->
    <div class="hero-disc serif">{{ heroText }}</div>
  </div>
</template>

<script setup lang="ts">
import { layout, RINGS, bucket } from '~~/shared/layout'
import type { LayoutNode } from '~~/shared/layout'
import type { Match } from '~~/shared/flavors'

const { t } = useI18n()

// 6 seeds assigned pct values that give 2-2-2 ring distribution
const HERO_MATCHES: Match[] = [
  { name: 'Fig',        pct: 94, axis: 'r', why: '', note: '' },
  { name: 'Coffee',     pct: 90, axis: 'r', why: '', note: '' },
  { name: 'Strawberry', pct: 85, axis: 'g', why: '', note: '' },
  { name: 'Basil',      pct: 80, axis: 'g', why: '', note: '' },
  { name: 'Miso',       pct: 74, axis: 'r', why: '', note: '' },
  { name: 'Garlic',     pct: 70, axis: 'g', why: '', note: '' },
]

const nodes = computed(() => layout(HERO_MATCHES))

const nodeGroups = computed(() => {
  const groups: Array<Array<{ node: LayoutNode; idx: number }>> = [[], [], []]
  nodes.value.forEach((node, idx) => { groups[bucket(node.pct)]!.push({ node, idx }) })
  return groups
})

// Hero disc text: tagline split across 3 lines
const heroText = computed(() => t('brand.tagline'))

const SPEEDS  = [0.20, 0.133, 0.10]
const angles  = ref([0, 0, 0])
const hovered = ref(false)
let rafId: number | null = null

onMounted(() => {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const tick = () => {
    if (!hovered.value) {
      angles.value = [
        (angles.value[0]! + SPEEDS[0]!) % 360,
        (angles.value[1]! + SPEEDS[1]!) % 360,
        (angles.value[2]! + SPEEDS[2]!) % 360,
      ]
    }
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
})
onUnmounted(() => { if (rafId !== null) cancelAnimationFrame(rafId) })
</script>

<style scoped>
.orbit-spinner {
  position: absolute;
  inset: 0;
  transform-origin: center;
  will-change: transform;
  pointer-events: none;
}
.orbit-spinner :deep(button.node) {
  pointer-events: auto;
}
.hero-disc {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: 118px; height: 118px;
  border-radius: 50%;
  background: var(--card);
  border: 1.5px solid var(--line-2);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  font-style: italic;
  font-size: 13px;
  line-height: 1.35;
  text-align: center;
  color: var(--soft);
  pointer-events: none;
  padding: 8px;
  word-break: break-word;
}
</style>
