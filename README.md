# Mingo

> *flavors that mingle*

**Mingo** is a free, no-account web toy: type a seed ingredient and see the things that "secretly
love" it. Two lenses — **Classic** (recipe co-occurrence) and **Surprising** (shared aroma compounds) —
re-rank the same ingredient. The signature view is an **orbit** (matches in rings around the seed;
closer = stronger) on wide screens, collapsing to a **ranked editorial list** on mobile. A single
hue axis (**whole → intense**, green→amber→red) is the only meaningful color.

The toy's job, in order: a fast **wow** → earn a **share** → convert to a **waitlist**.

## Stack

Nuxt 4 (Vue 3) + TypeScript, plain CSS (design tokens ported verbatim from the handoff), Resend
Audiences for the waitlist, PostHog for funnel analytics, deployed to Vercel.

## Dev

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build (Vercel preset)
npm run preview   # preview built output
npm run typecheck
```

## Env

Copy `.env.example` → `.env` and fill in:

```
RESEND_API_KEY=
RESEND_AUDIENCE_ID=
NUXT_PUBLIC_POSTHOG_KEY=
```

## Design handoff

Source: `~/Downloads/design_handoff_mingo/`. `mingo.css` is the token source of truth; see
`CLAUDE.md` for architecture guidance.
