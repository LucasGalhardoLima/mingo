<template>
  <div class="surface-web">
    <div style="text-align:center;margin-bottom:10px">
      <Notice />
      <div class="ed-eyebrow" style="justify-content:center">
        <span class="lab">Things that secretly love</span>
      </div>
    </div>

    <div class="orbit-layout">
      <!-- Stage -->
      <div>
        <div
          class="stage"
          style="--stage:460px"
          @mouseenter="hovered = true"
          @mouseleave="hovered = false; mingo.sel.value = null"
        >
          <!-- Three independent spinners — one per ring, each at its own speed -->
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
              :key="`${mingo.seedKey.value}-${idx}`"
              :n="node"
              :i="idx"
              :angle="angles[r] ?? 0"
            />
          </div>

          <!-- Static: ring labels, seed disc, why popover -->
          <span class="ringlab" :style="{ left: `${(230 - RINGS[0] * 0.5) / 460 * 100}%`, top: `${(230 - RINGS[0] * 0.866) / 460 * 100}%` }">strong</span>
          <span class="ringlab" :style="{ left: `${(230 - RINGS[1] * 0.5) / 460 * 100}%`, top: `${(230 - RINGS[1] * 0.866) / 460 * 100}%` }">good</span>
          <span class="ringlab" :style="{ left: `${(230 - RINGS[2] * 0.5) / 460 * 100}%`, top: `${(230 - RINGS[2] * 0.866) / 460 * 100}%` }">stretch</span>

          <div class="seed live-pop" :key="mingo.seedKey.value">
            <span class="nm" :style="{ fontSize: seedFontSize }">{{ seedLabel }}</span>
            <span class="lb">seed</span>
          </div>

          <div
            v-if="activeRotated"
            class="why show"
            :style="{
              left: `${activeRotated.x / 460 * 100}%`,
              top:  `${(activeRotated.y - 26) / 460 * 100}%`,
            }"
          >
            <div class="wh">{{ lensLabel }} · why</div>
            <div class="wt">{{ activeRotated.why }}.</div>
          </div>
        </div>
      </div>

      <!-- Rail -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <Lens />
        <div class="lab" style="display:flex;justify-content:space-between">
          <span>Ranked · {{ mingo.lens.value === 'classic' ? 'recipe pairing' : 'aroma match' }}</span>
          <span style="color:var(--ax-r)">{{ lensLabel.toLowerCase() }}</span>
        </div>
        <div class="rows anim-list" :key="`${mingo.seedKey.value}-${mingo.lens.value}`">
          <div
            v-for="(n, i) in top4"
            :key="n.name"
            class="row-item"
            :style="{ animationDelay: `${i * 60}ms` }"
            @mouseenter="mingo.sel.value = n.name"
            @mouseleave="mingo.sel.value = null"
            @click="onRowClick(n.name)"
          >
            <div class="row-top">
              <span class="rn">{{ n.name }}</span>
              <span class="rp">{{ n.pct }}%</span>
            </div>
            <div class="meter">
              <span :class="fillClass[n.axis]" :style="{ width: `${n.pct}%` }"></span>
            </div>
            <div class="why-inline">
              <span class="d" :class="`ax-${n.axis}`"></span>{{ n.why }}
            </div>
          </div>
        </div>
        <hr class="hair" />
        <div class="axisleg">
          <span>whole</span><span class="axisbar"></span><span>intense</span>
        </div>
        <WaitlistBand v-if="showWaitlist" />
        <button v-else class="btn" @click="mingo.openShare()">↑ Share this genome</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FLAVORS } from '~~/shared/flavors'
import { layout, RINGS, fillClass, seedKeyFor, bucket } from '~~/shared/layout'
import type { LayoutNode } from '~~/shared/layout'

const mingo = useMingo()

const WAITLIST_AFTER = 3

const matches   = computed(() => mingo.genome.value?.[mingo.lens.value] ?? FLAVORS[mingo.seedKey.value]?.[mingo.lens.value] ?? [])
const nodes     = computed(() => layout(matches.value))
const top4      = computed(() => nodes.value.slice(0, 4))
const seedLabel    = computed(() => mingo.genome.value?.label ?? FLAVORS[mingo.seedKey.value]?.label ?? '')
const seedFontSize = computed(() => {
  const len = seedLabel.value.length
  if (len <= 6) return '32px'
  if (len <= 9) return '24px'
  return '19px'
})
const lensLabel    = computed(() => mingo.lens.value === 'classic' ? 'Classic' : 'Surprising')
const showWaitlist = computed(() => mingo.explores.value >= WAITLIST_AFTER)

// ── Per-ring orbital speeds (inner = fastest, like Kepler) ────────────────────
const SPEEDS = [0.20, 0.133, 0.10] // °/frame → 30 s / 45 s / 60 s per revolution

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

// Nodes grouped by which ring they sit on
const nodeGroups = computed(() => {
  const groups: Array<Array<{ node: LayoutNode; idx: number }>> = [[], [], []]
  nodes.value.forEach((node, idx) => {
    const b = bucket(node.pct)
    groups[b]!.push({ node, idx })
  })
  return groups
})

// Why-popover position adjusted for the ring-specific rotation angle
const activeRotated = computed(() => {
  if (!mingo.sel.value) return null
  const node = nodes.value.find(n => n.name === mingo.sel.value)
  if (!node) return null
  const r = bucket(node.pct)
  const θ = (angles.value[r] ?? 0) * Math.PI / 180
  const dx = node.x - 230
  const dy = node.y - 230
  return {
    ...node,
    x: 230 + dx * Math.cos(θ) - dy * Math.sin(θ),
    y: 230 + dx * Math.sin(θ) + dy * Math.cos(θ),
  }
})

function onRowClick(name: string) {
  const k = seedKeyFor(name)
  if (k) mingo.pickSeed(k)
}
</script>

<style scoped>
.orbit-spinner {
  position: absolute;
  inset: 0;
  transform-origin: center;
  will-change: transform;
}
</style>
