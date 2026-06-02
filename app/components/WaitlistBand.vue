<template>
  <div class="waitlist">
    <div v-if="done" class="serif" style="font-style:italic;font-size:18px">
      You're on the list ✦
    </div>
    <template v-else>
      <div class="serif" style="font-size:20px;font-style:italic">Want this for your whole kitchen?</div>
      <div class="muted" style="font-size:14px">Swaps, pantry &amp; health goals — get the app.</div>
      <form class="wl-in" @submit.prevent="submit">
        <input
          v-model="email"
          type="email"
          placeholder="your email"
          :disabled="loading"
          autocomplete="email"
        />
        <!-- honeypot -->
        <input v-model="website" type="text" name="website" tabindex="-1" style="display:none" aria-hidden="true" />
        <button type="submit" class="btn fill" style="flex:0 0 auto" :disabled="loading">
          {{ loading ? '…' : 'Join →' }}
        </button>
      </form>
      <p v-if="error" style="font-size:13px;color:var(--ax-r);margin:0">{{ error }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
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
    error.value = 'Something went wrong — try again.'
  } finally {
    loading.value = false
  }
}
</script>
