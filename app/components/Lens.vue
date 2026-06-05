<template>
  <div class="cs">
    <button :aria-pressed="mingo.lens.value === 'classic'" @click="mingo.swapLens('classic')">
      <span class="d ax-g"></span>{{ $t('lens.classic') }}
    </button>
    <button :aria-pressed="mingo.lens.value === 'surprising'" @click="mingo.swapLens('surprising')">
      <span class="d ax-r"></span>{{ $t('lens.surprising') }}
    </button>
  </div>
</template>

<script setup lang="ts">
const mingo = useMingo()
</script>
