<template>
  <div class="card-inner">
    <div class="lab" style="color:var(--paper);opacity:.6">{{ lensWord }} {{ $t('share.poster.pairing') }}</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center">
      <div class="serif" style="font-style:italic;font-size:50px;line-height:.9">{{ label }}</div>
      <div class="serif" style="font-size:38px;color:var(--ax-r);margin:2px 0">×</div>
      <div class="serif" style="font-style:italic;font-size:50px;line-height:.9">{{ top.name }}</div>
      <div style="font-size:14px;color:var(--paper);opacity:.7;max-width:220px;margin:18px auto 0;line-height:1.35">
        {{ sentence }}. {{ $t('share.poster.neverGuess') }}
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline">
      <span class="serif" style="font-size:23px">Mingo</span>
      <span class="serif" style="font-style:italic;font-size:13px;opacity:.7">{{ $t('brand.tagline') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ seedKey: string; lens: 'classic' | 'surprising' }>()

const { t, locale } = useI18n()
const localeFlavors = useLocaleFlavors()
const label    = computed(() => localeFlavors.value[props.seedKey]?.label ?? props.seedKey)
const lensWord = computed(() => props.lens === 'classic' ? t('lens.classic').toLowerCase() : t('lens.surprising').toLowerCase())
const top      = computed(() => localeFlavors.value[props.seedKey]![props.lens][0]!)
const sentence = computed(() => {
  const why = top.value.why
  if (locale.value.startsWith('pt')) {
    // PT why already starts with "compartilha …" or "combinado em …" — capitalise first letter
    return why.charAt(0).toUpperCase() + why.slice(1)
  }
  // EN: strip "shares" / "paired in … recipes ·" prefix and prepend "They"
  const clean = why
    .replace(/^shares?\s/i, 'share ')
    .replace(/^paired.*recipes\s·?\s?/i, 'pair constantly — ')
  return `They ${clean}`
})
</script>

<style scoped>
.card-inner {
  position: absolute; inset: 0; background: var(--ink); color: var(--paper);
  display: flex; flex-direction: column; padding: 26px 24px 22px; overflow: hidden;
}
</style>
