import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; website?: string }>(event)

  // Honeypot
  if (body.website) return { ok: true }

  const email = (body.email ?? '').trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }

  const config = useRuntimeConfig()
  if (!config.resendApiKey || !config.resendAudienceId) {
    // Return success in dev when keys aren't configured
    return { ok: true }
  }

  const resend = new Resend(config.resendApiKey)
  await resend.contacts.create({
    email,
    audienceId: config.resendAudienceId,
    unsubscribed: false,
  })

  return { ok: true }
})
