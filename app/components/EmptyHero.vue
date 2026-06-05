<template>
  <div style="text-align:center;padding:18px 0 6px">
    <div class="lab" style="margin-bottom:8px">{{ $t('hero.eyebrow') }}</div>
    <i18n-t keypath="hero.heading" tag="div" class="serif" style="font-size:clamp(34px,4.5vw,46px);line-height:.94;font-style:italic;margin:0 auto 14px;max-width:640px">
      <template #blank><span style="font-style:normal;white-space:nowrap">___?</span></template>
    </i18n-t>

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
const { locale } = useI18n()

const TEASERS_EN = [
  { seed: 'Fig',        match: 'Blue cheese', note: 'shares ~12 aroma compounds · honeyed funk' },
  { seed: 'Miso',       match: 'Caramel',     note: 'shares ~9 compounds · Maillard depth' },
  { seed: 'Strawberry', match: 'Peach',       note: 'shares ~8 compounds · summer stone' },
  { seed: 'Coffee',     match: 'Irish Cream', note: 'shares ~5 compounds · creamy bitter' },
  { seed: 'Basil',      match: 'Tarragon',    note: 'shares ~12 compounds · anise kin' },
  { seed: 'Cúrcuma',    match: 'Açafrão',     note: 'shares ~12 compounds · golden pigment' },
]

const TEASERS_PT = [
  { seed: 'Figo',       match: 'Queijo Azul', note: 'compartilha ~12 compostos · funk adocicado' },
  { seed: 'Missô',      match: 'Caramelo',    note: 'compartilha ~9 compostos · profundidade Maillard' },
  { seed: 'Morango',    match: 'Pêssego',     note: 'compartilha ~8 compostos · frutas de caroço no verão' },
  { seed: 'Café',       match: 'Irish Cream', note: 'compartilha ~5 compostos · amargo cremoso' },
  { seed: 'Manjericão', match: 'Estragão',    note: 'compartilha ~12 compostos · família do anis' },
  { seed: 'Cúrcuma',    match: 'Açafrão',     note: 'compartilha ~12 compostos · pigmento dourado' },
]

const teasers   = computed(() => locale.value.startsWith('pt') ? TEASERS_PT : TEASERS_EN)
const teaserIdx = ref(0)
const teaser    = computed(() => teasers.value[teaserIdx.value % teasers.value.length]!)

onMounted(() => {
  if (!import.meta.client) return
  setInterval(() => { teaserIdx.value++ }, 4000)
})
</script>
