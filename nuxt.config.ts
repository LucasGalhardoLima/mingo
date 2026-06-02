export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  future: { compatibilityVersion: 4 },
  ssr: true,
  devtools: { enabled: true },
  css: ['~/assets/css/mingo.css'],
  modules: ['@nuxt/fonts', 'nuxt-posthog'],
  fonts: {
    families: [
      { name: 'Newsreader', provider: 'google', weights: [300, 400, 500], styles: ['normal', 'italic'] },
      { name: 'Hanken Grotesk', provider: 'google', weights: [400, 500, 600] },
    ],
  },
  runtimeConfig: {
    resendApiKey: '',
    resendAudienceId: '',
    public: {
      posthogKey: '',
    },
  },
  nitro: {
    preset: 'vercel',
  },
})
