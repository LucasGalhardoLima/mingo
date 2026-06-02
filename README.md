# Mingo

> *flavors that mingle*

**Mingo** is a free, no-account web toy: type a seed ingredient and see the things that "secretly
love" it. Two lenses — **Classic** (recipe co-occurrence) and **Surprising** (shared aroma compounds) —
re-rank the same ingredient. The signature view is an **orbit** (matches in rings around the seed;
closer = stronger) on wide screens, collapsing to a **ranked editorial list** on mobile. A single
hue axis (**whole → intense**, green→amber→red) is the only meaningful color.

The toy's job, in order: a fast **wow** → earn a **share** → convert to a **waitlist**.

## Status
Greenfield. The build plan lives in [`PLAN.md`](./PLAN.md).

**Stack (planned):** Nuxt 4 (Vue 3) + TypeScript, plain CSS (design tokens ported verbatim from the
handoff), Resend Audiences for the waitlist, PostHog for funnel analytics, deployed to Vercel.

Design handoff source: `~/Downloads/design_handoff_mingo/`.
