# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mingo is a greenfield Nuxt 4 (Vue 3) + TypeScript web toy. The full build plan lives in `PLAN.md` — read it before starting any significant work.

## Commands

```bash
npx nuxi init .          # scaffold (run once; accept overwrite prompts)
npm run dev              # dev server
npm run build            # production build (Nitro/Vercel preset)
npm run preview          # preview built output locally
npm run typecheck        # vue-tsc --noEmit
```

## Architecture

### Nuxt 4 directory layout
`app/` is the app root (`~` alias points here). `server/` and `shared/` sit at the repo root, not inside `app/`. This is Nuxt 4 default — **do not put server routes or shared logic under `app/`**.

### CSS: mingo.css is the token source of truth
`app/assets/css/mingo.css` is a near-verbatim port of the design handoff CSS. Registered in `nuxt.config.ts` via `css: [...]`. **Do not re-express its tokens in Tailwind, UnoCSS, or CSS variables elsewhere** — pixel accuracy is the goal and the CSS is carried as-is intentionally. When removing prototype-only rules (`.browser*`, `.phone*`, `.gallery`, `.surf-seg`, etc.), keep all component classes and the `@keyframes` untouched.

### Responsive: three bands, not two
The orbit stage is **hard-locked to 460px** (`layout()` returns absolute px from a 230px center; all node positions are `translate(calc(-50% + Npx))`). A fluid stage breaks node geometry. Instead, **both `OrbitSurface` and `ListSurface` are always in the DOM** and toggled purely with CSS `display`:

| Viewport | Surface | Layout |
|---|---|---|
| `< 640px` | `ListSurface` | editorial list; `.surface-web { display:none }` |
| `640–900px` | `OrbitSurface` | orbit centered, rail stacks below |
| `≥ 900px` | `OrbitSurface` | orbit + 360px rail side-by-side (`1fr 360px` grid) |

This is SSR-safe (no `window` read, no JS resize listener). The 640–900px "single-column orbit" band is load-bearing — skipping it causes overflow in that range.

### State: useMingo() composable + provide/inject
`app/composables/useMingo.ts` is the single controller. `app.vue` calls it once and `provide()`s the result. Every component injects it — no prop drilling. Both surfaces share one truth; each keeps its own hover-selection ref (`sel` for web, `mSel` for mobile).

### shared/ — framework-agnostic logic
`shared/flavors.ts` and `shared/layout.ts` are plain TypeScript importable by both the app and server routes. The dataset is exactly 5 seeds (fig, coffee, strawberry, basil, miso); the "1,790 staples" copy is aspirational. `resolveQuery()` in `layout.ts` is the 4-outcome constrained search (direct → alias → no-match → oov).

### Server: waitlist route
`server/api/waitlist.post.ts` (Nitro). Flow: honeypot check → email validation → `resend.contacts.create()` (idempotent; dedupes by email) → optional welcome email gated behind a config flag (requires verified sending domain; the contact-add does not). Credentials live in `runtimeConfig` as `resendApiKey` / `resendAudienceId` — never in `.env` files that are committed.

### Share / image export gotcha
`html-to-image` (`toPng`) is used for the Download action. **Always `await document.fonts.ready` before calling `toPng`** — Newsreader and Hanken Grotesk fall back to system fonts in the PNG if fonts aren't ready. All share/export code is guarded with `onMounted` / `import.meta.client`.

### Analytics
`app/utils/analytics.ts` exports a `track()` wrapper over PostHog. Funnel events (in order): `seed_explored` → `lens_swapped` → `share_opened` → `share_downloaded` / `link_copied` → `waitlist_submitted`. Call `track()` from actions in `useMingo.ts` and component handlers — not from watchers.

### OrbitNode animation
Nodes bloom from center (`scale(.25) → 1`, `.6s cubic-bezier(.22,1,.36,1)`) with a `i * 45ms` stagger driven by `onMounted` + `requestAnimationFrame` flipping a ref. On a lens swap, nodes are keyed by slot so they **glide** to new positions (FLIP-style morph) rather than re-mounting. Animation code is guarded for SSR.

## Environment variables

```
RESEND_API_KEY
RESEND_AUDIENCE_ID
NUXT_PUBLIC_POSTHOG_KEY
```

Provide an `.env.example` with these keys (empty values). The actual `.env` is gitignored.
