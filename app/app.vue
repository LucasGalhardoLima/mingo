<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ShareOverlay v-if="mingo.share.value" />
</template>

<script setup lang="ts">
const mingo = provideMingo()
</script>
