<template>
  <svg viewBox="0 0 460 200" overflow="visible" style="width:100%;height:170px">
    <g class="ring spinning" stroke-opacity="0.35">
      <circle cx="230" cy="120" r="58" />
      <circle cx="230" cy="120" r="108" />
      <circle cx="230" cy="120" r="158" />
    </g>
  </svg>
</template>

<style scoped>
.spinning {
  transform-origin: 230px 120px;
  animation: ghost-spin 40s linear infinite;
}
@keyframes ghost-spin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .spinning { animation: none; }
}
</style>
