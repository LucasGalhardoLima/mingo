export function track(event: string, props?: Record<string, unknown>): void {
  if (!import.meta.client) return
  try {
    const app = useNuxtApp() as any
    app.$posthog?.()?.capture(event, props)
  } catch {}
}
