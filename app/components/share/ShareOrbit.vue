<template>
  <div class="card-inner">
    <div class="lab">{{ label }}'s genome · {{ lensWord }}</div>
    <div style="position:relative;flex:1;margin:4px 0">
      <svg viewBox="0 0 360 352" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible">
        <g fill="none" stroke="var(--ink)" stroke-opacity="0.16" stroke-dasharray="2 7">
          <circle :cx="cx" :cy="cy" :r="R[0]" />
          <circle :cx="cx" :cy="cy" :r="R[1]" />
          <circle :cx="cx" :cy="cy" :r="R[2]" />
        </g>
        <circle
          v-for="n in scaled"
          :key="n.name"
          :cx="n.px" :cy="n.py" r="8"
          :fill="AX[n.axis]"
          stroke="var(--card)" stroke-width="2"
        />
        <circle :cx="cx" :cy="cy" r="34" fill="var(--ink)" />
        <text
          :x="cx" :y="cy + 6"
          text-anchor="middle"
          font-family="Newsreader" font-style="italic"
          font-size="24" fill="var(--paper)"
        >{{ label }}</text>
      </svg>
      <div
        v-for="n in scaled"
        :key="n.name + '-label'"
        :style="{
          position: 'absolute',
          left: `${n.px / 360 * 100}%`,
          top:  `${n.py / 352 * 100}%`,
          transform: `translate(-50%,-50%) translateX(${n.px < cx ? -16 : 16}px)`,
          whiteSpace: 'nowrap',
          textAlign:  n.px < cx ? 'right' : 'left',
          fontFamily: 'var(--font-display)',
          fontSize:   '13px',
          width: 0,
          display: 'flex',
          justifyContent: n.px < cx ? 'flex-end' : 'flex-start',
        }"
      >
        <span :style="{ transform: `translateX(${n.px < cx ? -2 : 2}px)` }">
          {{ n.name }}<span class="lab" style="font-size:9px;margin-left:6px">{{ n.pct }}%</span>
        </span>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--line);padding-top:12px">
      <span class="serif" style="font-size:22px">Mingo</span>
      <span class="lab" style="font-size:10px">closer = stronger</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FLAVORS } from '~~/shared/flavors'
import { layout } from '~~/shared/layout'

const props = defineProps<{ seedKey: string; lens: 'classic' | 'surprising' }>()

const cx = 180; const cy = 176; const R = [52, 92, 128]
const AX: Record<string, string> = { g: 'var(--ax-g)', a: 'var(--ax-a)', r: 'var(--ax-r)' }

const label    = computed(() => FLAVORS[props.seedKey]?.label ?? props.seedKey)
const lensWord = computed(() => props.lens === 'classic' ? 'classic' : 'surprising')

const scaled = computed(() =>
  layout(FLAVORS[props.seedKey]?.[props.lens] ?? []).slice(0, 5).map(n => {
    const ox = (n.x - 230) / 198 * 128
    const oy = (n.y - 230) / 198 * 128
    return { ...n, px: cx + ox, py: cy + oy }
  })
)
</script>

<style scoped>
.card-inner {
  position: absolute; inset: 0; background: var(--card);
  display: flex; flex-direction: column; padding: 24px 24px 20px; overflow: hidden;
}
</style>
