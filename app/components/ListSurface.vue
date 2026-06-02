<template>
  <div class="surface-mobile">
    <Notice />
    <div class="ed-eyebrow">
      <span class="lab">Things that secretly love</span>
    </div>
    <div class="ed-seed live-pop" :key="mingo.seedKey.value" style="margin-bottom:14px">
      {{ seedLabel }}
    </div>
    <div style="margin-bottom:16px">
      <Lens />
    </div>
    <div class="anim-list" :key="`${mingo.seedKey.value}-${mingo.lens.value}`" style="display:flex;flex-direction:column;gap:12px">
      <div
        v-for="(n, i) in top4"
        :key="n.name"
        class="row-card"
        :class="{ selected: mingo.mSel.value === n.name }"
        :style="{ animationDelay: `${i * 60}ms` }"
        @click="onCardClick(n.name)"
      >
        <div class="row-top">
          <span class="rn">{{ n.name }}</span>
          <span class="rp">
            <span v-if="i === 0" class="fit">fits</span>
            {{ n.pct }}%
          </span>
        </div>
        <div class="meter">
          <span :class="fillClass[n.axis]" :style="{ width: `${n.pct}%` }"></span>
        </div>
        <div class="why-inline">
          <span class="d" :class="`ax-${n.axis}`"></span>{{ n.why }}
        </div>
      </div>
    </div>

    <div style="margin-top:16px">
      <WaitlistBand v-if="showWaitlist" />
      <div v-else class="btn-row">
        <button class="btn" @click="mingo.openShare()">↑ Share</button>
        <button class="btn fill">Get the app →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FLAVORS } from '~~/shared/flavors'
import { fillClass, seedKeyFor } from '~~/shared/layout'

const mingo = useMingo()

const WAITLIST_AFTER = 3

const top4      = computed(() => FLAVORS[mingo.seedKey.value]![mingo.lens.value].slice(0, 4))
const seedLabel = computed(() => FLAVORS[mingo.seedKey.value]?.label ?? '')
const showWaitlist = computed(() => mingo.explores.value >= WAITLIST_AFTER)

function onCardClick(name: string) {
  const k = seedKeyFor(name)
  if (k) mingo.pickSeed(k)
  else mingo.mSel.value = mingo.mSel.value === name ? null : name
}
</script>

<style scoped>
.selected { border-color: var(--ink); box-shadow: var(--shadow-md); }
</style>
