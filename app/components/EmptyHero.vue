<template>
  <div style="text-align:center;padding:18px 0 6px">
    <div class="lab" style="margin-bottom:8px">find out</div>
    <div class="serif" style="font-size:clamp(38px,6vw,58px);line-height:.94;font-style:italic;margin:0 auto 20px;max-width:640px">
      What secretly loves <span style="font-style:normal">___</span>?
    </div>
    <div style="max-width:440px;margin:0 auto">
      <SeedSearch :big="true" />
    </div>
    <div class="lab" style="margin:18px 0 10px">or try one of these</div>
    <div class="chips" style="justify-content:center">
      <span
        v-for="c in SEED_CHIPS"
        :key="c.key"
        class="chip"
        tabindex="0"
        role="button"
        @click="mingo.pickSeed(c.key)"
        @keydown.enter="mingo.pickSeed(c.key)"
      >
        <span class="d" :class="`ax-${c.axis}`"></span>
        {{ FLAVORS[c.key]!.label.toLowerCase() }}
      </span>
    </div>
    <GhostRings />
  </div>
</template>

<script setup lang="ts">
import { FLAVORS, SEED_CHIPS } from '~~/shared/flavors'
const mingo = useMingo()
</script>
