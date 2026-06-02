<template>
  <button
    class="node"
    :class="{ lead: isLead }"
    :style="nodeStyle"
    @mouseenter="mingo.sel.value = n.name"
    @mouseleave="mingo.sel.value = null"
    @focus="mingo.sel.value = n.name"
    @blur="mingo.sel.value = null"
    @click="handleClick"
  >
    <span class="dot" :class="`ax-${n.axis}`"></span>
    <span class="nn">{{ n.name }}</span>
    <span class="pp">{{ n.pct }}%</span>
  </button>
</template>

<script setup lang="ts">
import type { LayoutNode } from '~~/shared/layout'
import { seedKeyFor } from '~~/shared/layout'

const props = defineProps<{ n: LayoutNode; i: number }>()

const mingo    = useMingo()
const bloomed  = ref(false)
const isLead   = computed(() => mingo.sel.value === props.n.name)

onMounted(() => { requestAnimationFrame(() => { bloomed.value = true }) })

const ox = computed(() => props.n.x - 230)
const oy = computed(() => props.n.y - 230)

const nodeStyle = computed(() => ({
  left:     '50%',
  top:      '50%',
  transform: bloomed.value
    ? `translate(calc(-50% + ${ox.value}px), calc(-50% + ${oy.value}px)) scale(1)${isLead.value ? ' translateY(-3px)' : ''}`
    : 'translate(-50%,-50%) scale(.25)',
  opacity:   bloomed.value ? 1 : 0,
  transition: `transform .6s cubic-bezier(.22,1,.36,1) ${props.i * 45}ms, opacity .5s ease ${props.i * 45}ms, box-shadow .14s, border-color .14s`,
  zIndex:    isLead.value ? 5 : 2,
}))

function handleClick() {
  const k = seedKeyFor(props.n.name)
  if (k) mingo.pickSeed(k)
  else mingo.sel.value = props.n.name
}
</script>
