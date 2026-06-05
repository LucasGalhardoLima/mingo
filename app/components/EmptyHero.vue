<template>
  <div style="text-align:center;padding:18px 0 6px">
    <div class="lab" style="margin-bottom:8px">{{ $t('hero.eyebrow') }}</div>
    <div class="serif" style="font-size:clamp(38px,6vw,58px);line-height:.94;font-style:italic;margin:0 auto 14px;max-width:640px">
      {{ $t('hero.heading') }} <span style="font-style:normal">{{ $t('hero.blank') }}</span>{{ $t('hero.headingQ') }}
    </div>

    <p class="muted" style="font-size:15px;margin:0 auto 18px;max-width:420px;line-height:1.5">
      {{ $t('hero.subheading') }}
    </p>

    <div class="teaser" style="margin-bottom:24px;min-height:22px">
      <span class="serif" style="font-style:italic">{{ teaser.seed }}</span>
      <span class="muted"> × </span>
      <span class="serif" style="font-style:italic">{{ teaser.match }}</span>
      <span class="muted" style="font-size:12px"> — {{ teaser.note }}</span>
    </div>

    <div style="max-width:440px;margin:0 auto 0">
      <SeedSearch :big="true" />
    </div>

    <HeroOrbit />
  </div>
</template>

<script setup lang="ts">
const TEASERS = [
  { seed: 'Fig',        match: 'Blue cheese', note: 'shares ~12 aroma compounds · honeyed funk' },
  { seed: 'Miso',       match: 'Caramel',     note: 'shares ~9 compounds · Maillard depth' },
  { seed: 'Strawberry', match: 'Peach',       note: 'shares ~8 compounds · summer stone' },
  { seed: 'Coffee',     match: 'Irish Cream', note: 'shares ~5 compounds · creamy bitter' },
  { seed: 'Basil',      match: 'Tarragon',    note: 'shares ~12 compounds · anise kin' },
  { seed: 'Turmeric',   match: 'Saffron',     note: 'shares ~12 compounds · golden pigment' },
]

const teaserIdx = ref(0)
const teaser    = computed(() => TEASERS[teaserIdx.value % TEASERS.length]!)

onMounted(() => {
  if (!import.meta.client) return
  setInterval(() => { teaserIdx.value++ }, 4000)
})
</script>
