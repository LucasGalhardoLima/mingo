<template>
  <div class="waitlist">
    <div v-if="done" class="serif" style="font-style:italic;font-size:18px">
      {{ $t('waitlist.success') }}
    </div>
    <template v-else>
      <div class="serif" style="font-size:20px;font-style:italic">{{ $t('waitlist.heading') }}</div>
      <div class="muted" style="font-size:14px">{{ $t('waitlist.subheading') }}</div>
      <form class="wl-in" @submit.prevent="submit">
        <input
          v-model="email"
          type="email"
          :placeholder="$t('waitlist.placeholder')"
          :disabled="loading"
          autocomplete="email"
        />
        <!-- honeypot -->
        <input v-model="website" type="text" name="website" tabindex="-1" style="display:none" aria-hidden="true" />
        <button type="submit" class="btn fill" style="flex:0 0 auto" :disabled="loading">
          {{ loading ? $t('waitlist.loading') : $t('waitlist.join') }}
        </button>
      </form>
      <p v-if="error" style="font-size:13px;color:var(--ax-r);margin:0">{{ error }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const email   = ref('')
const website = ref('')
const loading = ref(false)
const done    = ref(false)
const error   = ref('')

async function submit() {
  error.value = ''
  if (!email.value.trim()) return
  loading.value = true
  try {
    await $fetch('/api/waitlist', {
      method: 'POST',
      body: { email: email.value.trim(), website: website.value },
    })
    done.value = true
    track('waitlist_submitted')
  } catch {
    error.value = t('waitlist.error')
  } finally {
    loading.value = false
  }
}
</script>
