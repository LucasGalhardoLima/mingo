<template>
  <div class="card-inner">
    <div class="axis-bar"></div>
    <div class="lab">{{ $t('orbit.eyebrow') }}</div>
    <div class="serif" style="font-style:italic;font-size:60px;line-height:.82;margin:4px 0 16px">{{ label }}</div>
    <div style="flex:1;display:flex;flex-direction:column">
      <div
        v-for="(n, i) in top3"
        :key="n.name"
        :style="{ borderTop: i ? '1px solid var(--line)' : '0', padding: '12px 0' }"
        style="display:flex;justify-content:space-between;align-items:baseline"
      >
        <span class="serif" style="font-size:24px;display:flex;align-items:center;gap:10px">
          <span class="d" :class="`ax-${n.axis}`" style="width:12px;height:12px;border-radius:50%;display:inline-block"></span>
          {{ n.name }}
        </span>
        <span class="lab" style="font-size:11px">{{ n.note }}</span>
      </div>
    </div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--line);padding-top:13px">
      <span class="serif" style="font-size:23px">Mingo</span>
      <span class="serif" style="font-style:italic;font-size:13px;color:var(--soft)">{{ $t('brand.tagline') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FLAVORS } from '~~/shared/flavors'

const props = defineProps<{ seedKey: string; lens: 'classic' | 'surprising' }>()
const label = computed(() => FLAVORS[props.seedKey]?.label ?? props.seedKey)
const top3  = computed(() => (FLAVORS[props.seedKey]?.[props.lens] ?? []).slice(0, 3))
</script>

<style scoped>
.card-inner {
  position: absolute; inset: 0; background: var(--card);
  display: flex; flex-direction: column; padding: 28px 26px 22px; overflow: hidden;
}
.axis-bar {
  height: 7px; border-radius: 7px;
  background: linear-gradient(90deg, var(--ax-g), var(--ax-a), var(--ax-r));
  margin-bottom: 20px;
}
</style>
