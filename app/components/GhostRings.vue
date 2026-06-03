<template>
  <svg viewBox="0 0 460 200" style="width:100%;height:170px;opacity:.85">
    <g class="ring spinning">
      <circle cx="230" cy="120" r="58" />
      <circle cx="230" cy="120" r="108" />
      <circle cx="230" cy="120" r="158" />
    </g>
  </svg>
</template>

<style scoped>
/* Rotate around the ring center (230,120) in SVG space */
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
