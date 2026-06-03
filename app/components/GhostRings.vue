<template>
  <svg viewBox="0 0 460 200" style="width:100%;height:170px;opacity:.5">
    <g class="ring">
      <circle cx="230" cy="120" r="58" />
      <circle cx="230" cy="120" r="108" />
      <circle cx="230" cy="120" r="158" />
    </g>
  </svg>
</template>

<style scoped>
svg {
  animation: orbit-spin 40s linear infinite;
  transform-origin: 50% 60%;
}
@keyframes orbit-spin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  svg { animation: none; }
}
</style>
