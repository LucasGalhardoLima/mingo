<template>
  <div class="page-shell">
    <div class="topbar">
      <div class="topbar-in m-head">
        <div class="m-brand">
          <NuxtLink to="/" class="m-wm" style="text-decoration:none;color:inherit">Mingo</NuxtLink>
          <span class="m-tag">{{ $t('brand.tagline') }}</span>
        </div>
        <SeedSearch v-if="route.name !== 'index'" />
        <nav class="m-nav">
          <a role="button" tabindex="0" @click="mingo.replay()" @keydown.enter="mingo.replay()">{{ $t('nav.firstRun') }}</a>
          <button class="btn" style="padding:0 8px;font-size:13px;border:1.5px solid var(--line-2);background:transparent" @click="toggleLocale">{{ $t('nav.langSwitch') }}</button>
          <span class="btn fill" style="padding:9px 18px;font-size:14px">{{ $t('nav.getApp') }}</span>
        </nav>
      </div>
    </div>
    <main class="page-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route  = useRoute()
const mingo  = useMingo()
const { locale, setLocale } = useI18n()

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'pt-BR' : 'en')
}
</script>

<style scoped>
.page-shell { min-height: 100vh; }
.topbar {
  position: sticky; top: 0; z-index: 60;
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.topbar-in { max-width: 1180px; margin: 0 auto; padding: 16px 30px; }
.page-content { max-width: 1180px; margin: 0 auto; padding: 36px 30px 120px; }
@media (max-width: 639px) {
  .topbar-in { padding: 12px 16px; gap: 10px; }
  .m-nav { display: none; }
  .page-content { padding: 24px 16px 80px; }
}
</style>
