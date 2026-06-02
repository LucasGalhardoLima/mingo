<template>
  <div class="search-wrap" :style="big ? 'flex:1;min-width:260px' : 'min-width:280px'">
    <label class="search">
      <span class="mag"></span>
      <input
        ref="inputEl"
        v-model="q"
        :placeholder="currentLabel.toLowerCase()"
        autocomplete="off"
        @focus="open = true"
        @blur="onBlur"
        @keydown.enter="onEnter"
        @keydown.escape="close"
        @input="open = true"
      />
    </label>

    <div v-if="open" class="dropdown">
      <!-- alias row -->
      <div
        v-if="alias"
        class="drop-row alias"
        @mousedown.prevent="pickAlias"
      >
        <span>↪ {{ alias.label }}</span>
        <span class="lab" style="font-size:9px">from "{{ alias.from }}"</span>
      </div>

      <!-- no-match -->
      <div v-if="noMatch" class="drop-section">
        <div class="lab" style="margin-bottom:6px">no strong match for "{{ noMatch.from }}"</div>
        <div class="chips" style="margin-bottom:4px">
          <span v-for="c in noMatch.cousins" :key="c.name" class="chip" style="cursor:default;font-size:14px">
            <span class="d" :class="`ax-${c.axis}`"></span>{{ c.name.toLowerCase() }}
          </span>
        </div>
        <div class="lab" style="margin:8px 0 0">try a staple</div>
      </div>

      <!-- oov header -->
      <div v-if="oov" class="drop-section">
        <div class="lab">"{{ oov.from }}" isn't one of our 1,790 staples</div>
        <div class="muted" style="font-size:13px;margin-top:3px">pick the nearest we do map:</div>
      </div>

      <!-- seed list -->
      <div
        v-for="key in listItems"
        :key="key"
        class="drop-row"
        @mousedown.prevent="pickKey(key)"
      >
        {{ FLAVORS[key]!.label }}
        <span class="lab" style="font-size:9px">staple</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FLAVORS } from '~~/shared/flavors'
import { resolveQuery } from '~~/shared/layout'

defineProps<{ big?: boolean }>()

const mingo = useMingo()
const q     = ref('')
const open  = ref(false)

const currentLabel = computed(() => FLAVORS[mingo.seedKey.value]?.label ?? 'fig')

const result = computed(() => resolveQuery(q.value))

const alias   = computed(() => { const r = result.value; return r.type === 'alias'    ? { seed: r.seed, label: FLAVORS[r.seed]!.label, from: r.from } : null })
const noMatch = computed(() => { const r = result.value; return r.type === 'no-match' ? { from: r.from, cousins: r.cousins } : null })
const oov     = computed(() => { const r = result.value; return r.type === 'oov'      ? { from: r.from } : null })

const listItems = computed(() => {
  const r = result.value
  if (r.type === 'direct' || r.type === 'oov') return r.items
  if (r.type === 'no-match') return Object.keys(FLAVORS)
  return []
})

function pick(key: string, note?: string) {
  mingo.pickSeed(key, note)
  close()
}

function pickAlias() {
  if (!alias.value) return
  pick(alias.value.seed, `Interpreted "${alias.value.from}" as ${alias.value.label}`)
}

function pickKey(key: string) {
  const r = result.value
  pick(key, r.type === 'oov' ? `"${r.from}" → ${FLAVORS[key]!.label}` : undefined)
}

function close() { q.value = ''; open.value = false }
function onBlur() { setTimeout(() => { open.value = false }, 160) }

function onEnter() {
  const r = result.value
  if (r.type === 'alias')  pick(r.seed, `Interpreted "${r.from}" as ${FLAVORS[r.seed]!.label}`)
  else if (r.type === 'direct' && r.items[0]) pick(r.items[0])
  else if (r.type === 'oov' && r.items[0])    pick(r.items[0], `"${r.from}" → ${FLAVORS[r.items[0]]!.label}`)
}
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
