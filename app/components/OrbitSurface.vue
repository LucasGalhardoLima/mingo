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
        <div class="stage" style="--stage:460px" @mouseleave="mingo.sel.value = null">
          <svg viewBox="0 0 460 460">
            <circle class="ring" cx="230" cy="230" :r="RINGS[0]" />
            <circle class="ring" cx="230" cy="230" :r="RINGS[1]" />
            <circle class="ring" cx="230" cy="230" :r="RINGS[2]" />
          </svg>
          <!-- labels at 120° (upper-left) — the only gap between nodes i=5 (150°) and i=0 (90°) -->
          <span class="ringlab" :style="{ left: `${(230 - RINGS[0] * 0.5) / 460 * 100}%`, top: `${(230 - RINGS[0] * 0.866) / 460 * 100}%` }">strong</span>
          <span class="ringlab" :style="{ left: `${(230 - RINGS[1] * 0.5) / 460 * 100}%`, top: `${(230 - RINGS[1] * 0.866) / 460 * 100}%` }">good</span>
          <span class="ringlab" :style="{ left: `${(230 - RINGS[2] * 0.5) / 460 * 100}%`, top: `${(230 - RINGS[2] * 0.866) / 460 * 100}%` }">stretch</span>

          <div class="seed live-pop" :key="mingo.seedKey.value">
            <span class="nm" :style="{ fontSize: seedFontSize }">{{ seedLabel }}</span>
            <span class="lb">seed</span>
          </div>

          <OrbitNode
            v-for="(n, i) in nodes"
            :key="`${mingo.seedKey.value}-${i}`"
            :n="n"
            :i="i"
          />

          <!-- why popover -->
          <div
            v-if="active"
            class="why show"
            :style="{
              left:  `${active.x / 460 * 100}%`,
              top:   `${(active.y - 26) / 460 * 100}%`,
            }"
          >
            <div class="wh">{{ lensLabel }} · why</div>
            <div class="wt">{{ active.why }}.</div>
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
import { layout, RINGS, fillClass, seedKeyFor } from '~~/shared/layout'

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
const lensLabel = computed(() => mingo.lens.value === 'classic' ? 'Classic' : 'Surprising')
const active    = computed(() => mingo.sel.value ? nodes.value.find(n => n.name === mingo.sel.value) ?? null : null)
const showWaitlist = computed(() => mingo.explores.value >= WAITLIST_AFTER)

function onRowClick(name: string) {
  const k = seedKeyFor(name)
  if (k) mingo.pickSeed(k)
}
</script>
