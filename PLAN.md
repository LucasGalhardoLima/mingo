# Mingo — Build Plan (Flavor Genome web toy) · Nuxt 4 / Vue

## Context
**Mingo** is the free, no-account web toy that serves as the viral wedge for the flavor-intelligence
app (name decided 2026-06-01; tagline *"flavors that mingle"*). You type a seed ingredient and it
shows what "secretly loves" it, re-ranked by two lenses — **Classic** (recipe co-occurrence) and
**Surprising** (shared aroma compounds). The signature view is an **orbit** (matches in rings around
the seed; closer = stronger) on wide screens, collapsing to a **ranked editorial list** on mobile.
A single hue axis (**whole→intense**, green→amber→red) is the only meaningful color.

The toy's job, in order: a fast **wow** → earn a **share** → convert to a **waitlist**. The build is
organized around those three beats.

**Source:** high-fidelity HTML/CSS+React prototype at `~/Downloads/design_handoff_mingo/`.
`mingo.css` is the **token source of truth**; the `.jsx` files are reference, not production code — the
handoff explicitly invites recreating in another framework (it lists Vue among targets). No Mingo
project exists yet in `~/Documents/Projects` → greenfield build.

**Decisions locked with the user this session:**
- **Stack: Nuxt 4 (Vue 3) + TypeScript** — chosen over Next/React. (Nuxt 4 is current — 4.4, Mar 2026.)
- **Full MVP + waitlist backend** (real email capture + funnel analytics, not just stubs).
- **Waitlist handled by Resend** (Audiences/Contacts API) — stores the signup *and* enables emailing it.
- **One real responsive app** — no fake browser chrome / phone bezel; a real media query at 640px.

---

## Stack: Nuxt 4 (Vue 3) + TypeScript, deployed to Vercel
- **Why Nuxt fits the brief well:** the user picked a waitlist backend + analytics, and Nuxt's **Nitro**
  server gives first-party API routes (`server/api/…`) with **zero extra service** and auto-deploys to
  Vercel (Nitro Vercel preset). SSR is kept on so `/genome/[seed]` produces real per-seed OG/Twitter
  unfurls — a direct boost to the "share" beat — while all interactivity hydrates client-side.
- **Nuxt 4 layout:** app code lives under **`app/`** (the `~` alias → `app/`); `server/` and `shared/`
  sit at the repo root. `nuxi init` scaffolds this by default.
- **Styling:** port `mingo.css` **near-verbatim** into `app/assets/css/mingo.css` and register it in
  `nuxt.config.ts` `css:[...]`. Do **not** re-express tokens in Tailwind/UnoCSS — the bar is pixel
  accuracy, and carrying the CSS as-is is both lowest-effort and lowest-risk.
- **Fonts:** `@nuxt/fonts` for **Newsreader** (preserve `ital` + `opsz` axes — italics carry the whole
  brand) and **Hanken Grotesk**. Drop Spectral/Playfair (only existed for the out-of-scope font tweak).
- **Waitlist:** **Resend Audiences** — `resend.contacts.create({ email, audienceId })` adds the signup to
  an Audience (this *is* the store; dedupes by email), and Resend's Broadcast/Emails API later sends the
  welcome mail + launch announcement. `RESEND_API_KEY` + `RESEND_AUDIENCE_ID` via `runtimeConfig`.
  (Adding a contact needs no verified domain; an optional welcome email does — keep that optional.)
- **Funnel analytics:** **PostHog** (`nuxt-posthog` module, free tier, real funnel charts) to measure
  wow→share→waitlist. Swappable; Vercel Web Analytics is the zero-extra-account fallback.

---

## File structure (Nuxt 4)
```
mingo/
  nuxt.config.ts          # css, modules (@nuxt/fonts, nuxt-posthog), runtimeConfig, vercel preset
  app/
    app.vue               # <NuxtPage/> + provides the useMingo() controller
    assets/css/mingo.css   # ← mingo.css ported verbatim (tokens + components) + responsive bands
    pages/
      index.vue           # '/' → empty hero (first-run)
      genome/[seed].vue   # canonical results URL; reads :seed param + ?lens; useSeoMeta() per seed
    components/
      SeedSearch.vue      # constrained picker (alias / no-match / oov / direct)
      Lens.vue  Notice.vue  WaitlistBand.vue
      OrbitSurface.vue    # web orbit (rings, seed disc, OrbitNode, why-popover, rail)
      OrbitNode.vue       # single node w/ bloom-from-center transition
      ListSurface.vue     # mobile editorial list (ranked cards)
      EmptyHero.vue GhostRings.vue
      share/ShareOverlay.vue ShareEditorial.vue ShareOrbit.vue SharePoster.vue
    composables/
      useMingo.ts         # controller: seedKey, lens, sel/mSel, phase, explores, notice, share + actions
    utils/
      analytics.ts        # track() wrapper for the funnel events (auto-imported)
  shared/                 # framework-agnostic; importable by both app + server
    flavors.ts            # typed port of flavordata.js (FLAVORS, SEED_CHIPS, STAPLE_ALIASES,
                          #   NO_MATCH_TERMS, FLAVOR_EDGE) + types
    layout.ts             # bucket(), layout(), RINGS, norm(), seedKeyFor(), resolveQuery(), fillClass
  server/api/
    waitlist.post.ts      # POST {email} → validate + honeypot + Resend contacts.create + rate-limit
```

---

## 1. Design system port (do first — everything depends on tokens)
- Copy `mingo.css` into `app/assets/css/mingo.css` unchanged: `:root` tokens (6 surfaces + 3 axis pairs),
  `.serif/.lab/.search/.cs/.stage/.ring/.seed/.node/.why/.row-item/.meter/.waitlist/.edge/.chip/.btn`,
  the `@keyframes` (fadein/popin/rowin/seedpop/edpop/shimmer), and the existing
  `@media (prefers-reduced-motion: reduce)` block — **keep that block as-is**.
- **Remove** the prototype-only scaffold rules that won't ship: `.browser*`, `.phone*`, `.page/.topbar/
  .section-head/.divider/.gallery/.surf-seg/.rframe/.bp-controls` (gallery + reflow-demo + frames).
- Page background keeps the dotted texture (`radial-gradient … 30px 30px`) on `body`.

## 2. Data + pure logic (`shared/`) — framework-agnostic, port verbatim
- `flavors.ts`: `type Match = { name; pct; axis:'g'|'a'|'r'; why; note }`, `FLAVORS` (5 seeds:
  fig/coffee/strawberry/basil/miso, each `classic`/`surprising`), plus `SEED_CHIPS`, `STAPLE_ALIASES`,
  `NO_MATCH_TERMS`, `FLAVOR_EDGE`. The "1,790 staples" copy stays aspirational; the real dataset is
  these 5 (Epicure embeddings are future work).
- `layout.ts`: `RINGS=[100,152,198]`, `bucket()`, `layout()` (polar: angle `90−i·60`, radius by pct
  bucket, `x:230+r·cos`, `y:230−r·sin`), `norm()`, `seedKeyFor()`, and **`resolveQuery()`** (the
  4-outcome constrained search: direct / alias / no-match / oov). These are plain TS — copy the
  prototype's exact math so geometry and search resolution stay identical.

## 3. State controller — `composables/useMingo.ts`
The React prototype threaded all state through props (`{...shared}`). In Vue, expose it once as a
composable and **provide/inject** it so both surfaces + the share overlay share one source of truth:
- reactive state: `seedKey` (default `'fig'`), `lens` (default `'surprising'`), `sel`, `mSel`, `phase`
  (`'results'|'empty'`), `explores` (waitlist at ≥3), `notice`, `share`.
- actions: `pickSeed(key, note?)` → sets seed, clears selections, sets notice, `phase='results'`,
  `explores++`, fires `seed_explored`; `swapLens(v)`; `openShare()`; `replay()` → empty hero.
- lens labels default **Classic / Surprising**. `app.vue` calls `useMingo()` once and `provide()`s it.

## 4. Component port (JSX → Vue SFCs with `<script setup>`)
Port each prototype function to an SFC, **dropping the `.browser`/`.phone` wrappers** (presentation
framing). Keep all live behavior:
- `SeedSearch` — dropdown with alias row (`↪ Staple from "<typed>"`), no-match cousins, oov mapping,
  Enter-to-resolve; emits `pick(key, noticeText)`.
- `OrbitNode` — bloom from center (`scale(.25)→1`, `transform .6s cubic-bezier(.22,1,.36,1)`, opacity
  `.5s`, stagger `i·45ms`). Faithful port: `onMounted` + `requestAnimationFrame` flips a `ref` and
  drives inline `:style` (delay `i*45ms`). *(Idiomatic alt: a `<TransitionGroup>` with FLIP handles the
  lens-swap glide via its `v-move` class — note it, but the manual port preserves the exact stagger/easing.)*
  Keyed by slot so a lens change **glides** nodes to new positions while labels swap (a morph, not a cut).
- `OrbitSurface` (was `ResultsWeb`): 3 dashed rings + `strong/good/stretch` labels, 118px ink seed disc
  (`seedpop`), up to 6 nodes, hover/**focus** why-popover (dark tooltip, lens-colored eyebrow), right
  rail (lens toggle · ranked top-4 with meters · hairline · whole→intense gradient legend · Share button
  **or** `WaitlistBand` once `explores≥3`).
- `ListSurface` (was `ResultsMobile`): eyebrow · big italic seed (`edpop`) · lens · 4 ranked cards (`#1`
  shows the `fits` badge) · bottom `Share` + `Get the app` row, swapped for `WaitlistBand` at `explores≥3`.
- `EmptyHero`/`GhostRings`, `Lens`, `Notice`, `WaitlistBand`.
- **A11y improvement (in spec — README says popover on "hover/focus"):** render orbit nodes as focusable
  `<button>`s so the why-popover is keyboard-reachable; keep hover behavior.

## 5. Responsive strategy — THE key decision (must be explicit)
The orbit is **hard-locked to a 460px stage** (`layout()` returns absolute px from a 230 center; nodes
position via `translate(calc(-50% + Npx))`). A fluid stage would misplace every node, so we keep the
stage fixed and switch *layouts*, not geometry. Width math: orbit-only = 460 stage + ~60 page padding ≈
**520px** (fits from 640 up); orbit **+ 360 rail + 34 gap** ≈ **914px** (does *not* fit at 640). So a
single `max-width:640px` switch would render a broken, overflowing layout in the 640–914 band.

**Three bands** (render both surfaces in the DOM, toggle with CSS `display` at 640 → SSR-safe under
Nuxt, no JS resize/`window` read needed, satisfies "real media query against viewport width"):
- **`<640px` → ListSurface** (editorial list). `.surface-web { display:none }`.
- **`640–900px` → OrbitSurface, single column:** orbit (fixed 460) centered, **rail stacks beneath it**.
- **`≥900px` → OrbitSurface, two columns:** the `1fr 360px` grid (orbit + side rail).

Bands 2/3 are an inner media query inside `OrbitSurface` (grid-template-columns toggle). Both surfaces
inject the same `useMingo()` controller; each keeps its own hover-selection (`sel` web / `mSel` mobile).
On `<640` the bloom is harmless (hidden) and reduced-motion is honored. (Client-only animation code is
guarded with `onMounted`/`import.meta.client` so SSR hydration is clean.)

## 6. Backend — waitlist (Resend) + analytics (the "convert" beat)
- `server/api/waitlist.post.ts` (Nitro): `readBody` → reject if honeypot field filled; validate email
  server-side; `resend.contacts.create({ email, audienceId: RESEND_AUDIENCE_ID, unsubscribed:false })`
  (dedupes by email — re-submit is idempotent); basic IP rate-limit; return `{ok:true}`. Optionally
  fire a welcome email via `resend.emails.send()` *(only once a sending domain is verified — gate it
  behind a config flag so the contact-add works without it)*. No PII beyond email; creds in
  `runtimeConfig` (`resendApiKey`, `resendAudienceId`).
- Wire `WaitlistBand` submit → `$fetch('/api/waitlist')`; inline success ("you're on the list ✦") +
  disable. Keep the existing visual design.
- **Funnel events** via `app/utils/analytics.ts`: `seed_explored` (seed+lens), `lens_swapped`,
  `share_opened`, `share_downloaded` (+style), `link_copied`, `waitlist_submitted` — the PostHog funnel.

## 7. Share moment (the "share" beat — now functional)
Port `ShareOverlay` + the 3 cards (Editorial / Orbit / Poster) exactly (4:5, recolor with axis tokens,
close on ✕/backdrop/Esc, `popin`/`fadein`). Make actions real (all client-guarded):
- **Download image:** `html-to-image` (`toPng`) on the live 4:5 card at export scale (~1080×1350).
  **Gotcha:** await `document.fonts.ready` before capture or Newsreader/Hanken fall back to system fonts
  in the PNG — budget for embedding/preloading the web fonts.
- **Copy link:** copy the canonical `/genome/<seed>?lens=<lens>` URL so a shared link reopens the exact
  state. `pages/genome/[seed].vue` reads the param + `?lens`, seeds `useMingo()`, and sets per-seed
  `useSeoMeta()` (title/OG/Twitter) for rich unfurls. `pages/index.vue` shows the empty hero.
- **Post:** `navigator.share` where available (mobile), else copy-link fallback. "Get the app" → stub
  link (no native app yet).

## Out of scope (presentation chrome / future)
Tweaks panel + palette switcher + font/density/label tweaks; the editorial page scaffold ("Hi-fi · Test
Kitchen" headers, States gallery, "Watch it reflow" width-slider demo); fake browser/phone chrome; the
real Epicure embedding engine (static 5-seed dataset stands in for the toy).

## Verification
1. `npm run dev` — walk every state: empty hero → pick chip → results; lens swap (nodes **glide**, labels
   morph); tap a seedable node/row → **re-center bloom**; search `espresso` (alias notice), `durian`
   (no-match cousins), `maldon flakes` (oov mapping), `fig` (direct); after 3 explores the Share CTA
   becomes the **WaitlistBand** on both surfaces; open Share → switch all 3 cards → **Download** a PNG
   (verify fonts render in the file) → **Copy link** → reopen that URL in a new tab and confirm state +
   that the OG meta is set (view source).
2. Responsive: resize across **639 / 641 / 899 / 901px** — list <640, orbit+stacked-rail 640–900,
   orbit+side-rail ≥900; no overflow in any band. Toggle OS "reduce motion" and confirm animations stop.
3. Waitlist: submit valid + invalid email; confirm the contact appears in the Resend Audience and a
   re-submit dedupes; honeypot blocks bots.
4. `npm run build` (+ `npm run preview`) clean; push a Vercel preview deploy; confirm funnel events land
   in PostHog.
```
