<template>
  <EmptyHero />
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title:         () => t('seo.index.title'),
  description:   () => t('seo.index.description'),
  ogTitle:       () => t('seo.index.ogTitle'),
  ogDescription: () => t('seo.index.ogDescription'),
})
</script>
