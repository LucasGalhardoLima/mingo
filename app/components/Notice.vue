<template>
  <div v-if="mingo.notice.value" class="notice">
    <span>{{ mingo.notice.value }}</span>
    <button aria-label="Dismiss" @click="mingo.clearNotice()">✕</button>
  </div>
</template>

<script setup lang="ts">
const mingo = useMingo()
</script>

<style scoped>
.notice {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--ax-a-soft); border: 1.5px solid var(--ax-a);
  border-radius: 30px; padding: 5px 8px 5px 14px;
  font-size: 13px; color: var(--ink); margin-bottom: 12px;
}
.notice button {
  border: 0; background: transparent; cursor: pointer;
  font-size: 13px; color: var(--soft); padding: 0 2px;
}
</style>
