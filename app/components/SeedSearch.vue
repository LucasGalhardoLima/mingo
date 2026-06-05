<template>
  <div class="search-wrap" :style="big ? 'flex:1;min-width:260px' : 'min-width:280px'">
    <label class="search">
      <span class="mag"></span>
      <input
        ref="inputEl"
        v-model="q"
        :placeholder="currentLabel.toLowerCase()"
        autocomplete="off"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.enter="onEnter"
        @keydown.escape="close"
        @input="open = true"
      />
    </label>

    <div v-if="open && results.length" class="dropdown">
      <div
        v-for="r in results"
        :key="r.key"
        class="drop-row"
        @mousedown.prevent="pick(r.key)"
      >
        {{ r.label }}
        <span class="lab" style="font-size:9px">{{ $t('search.staple') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FLAVORS } from '~~/shared/flavors'

defineProps<{ big?: boolean }>()

const mingo = useMingo()
const q     = ref('')
const open  = ref(false)

const currentLabel = computed(() => mingo.genome.value?.label ?? FLAVORS[mingo.seedKey.value]?.label ?? 'fig')

const results = ref<Array<{ key: string; label: string }>>([])
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function fetchResults(query: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    const data = await $fetch<Array<{ key: string; label: string }>>('/api/search', {
      query: { q: query },
    }).catch(() => [])
    results.value = data
  }, 120)
}

watch(q, v => { if (open.value) fetchResults(v) })

async function onFocus() {
  open.value = true
  if (!results.value.length) fetchResults('')
}

function pick(key: string, note?: string) {
  mingo.pickSeed(key, note)
  close()
}

function close() { q.value = ''; open.value = false }
function onBlur() { setTimeout(() => { open.value = false }, 160) }
function onEnter() { if (results.value[0]) pick(results.value[0].key) }
</script>

<style scoped>
.search-wrap { position: relative; }
.dropdown {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 40;
  background: var(--card); border: 1.5px solid var(--line-2); border-radius: 14px;
  box-shadow: var(--shadow-md); overflow: hidden;
  min-width: 300px; max-height: min(56vh, 360px); overflow-y: auto;
}
.drop-row {
  padding: 10px 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--font-display); font-size: 17px;
  border-top: 1px solid var(--line);
}
.drop-row:first-child { border-top: 0; }
.drop-row:hover { background: var(--paper-2); }
.alias { background: var(--ax-g-soft) !important; gap: 14px; white-space: nowrap; border-top: 0 !important; }
.drop-section { padding: 12px 16px; border-top: 0; }
</style>
