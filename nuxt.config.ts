export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  future: { compatibilityVersion: 4 },
  ssr: true,
  devtools: { enabled: true },
  css: ['~/assets/css/mingo.css'],
  modules: ['@nuxt/fonts', 'nuxt-posthog', '@nuxtjs/i18n'],
  i18n: {
    strategy: 'no_prefix',
    locales: [
      { code: 'en',    language: 'en-US', file: 'en.json',    name: 'English' },
      { code: 'pt-BR', language: 'pt-BR', file: 'pt-BR.json', name: 'Português' },
    ],
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'mingo_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'en',
    },
  },
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
