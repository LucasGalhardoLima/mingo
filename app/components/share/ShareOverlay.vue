<template>
  <div class="overlay-backdrop" @click="mingo.closeShare()" @keydown.escape="mingo.closeShare()">
    <div class="overlay-panel" @click.stop>
      <button class="close-btn" aria-label="Close" @click="mingo.closeShare()">✕</button>

      <!-- Live preview card -->
      <div class="card-frame" style="width:360px;height:450px;flex:0 0 auto">
        <div class="card-inner-wrap" style="width:360px;height:450px">
          <component :is="activeCard" :seed-key="seedKey" :lens="lens" />
        </div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <div>
          <div class="lab" style="color:var(--ax-r)">Share this genome</div>
          <div class="serif" style="font-size:27px;font-style:italic;line-height:1.08;margin:6px 0 4px">
            {{ label }} · {{ lensWord }}
          </div>
          <p class="muted" style="margin:0;font-size:14px">
            Exports at 4:5 for stories &amp; posts. No photos — type &amp; the axis do the work.
          </p>
        </div>

        <!-- Style picker -->
        <div>
          <div class="lab" style="margin-bottom:9px">Style</div>
          <div style="display:flex;gap:12px">
            <button
              v-for="c in CARDS"
              :key="c.key"
              class="thumb-btn"
              :class="{ active: pick === c.key }"
              @click="pick = c.key"
            >
              <!-- Thumbnail: scaled down card -->
              <div style="width:72px;height:90px;position:relative;overflow:hidden;border-radius:7px">
                <div style="width:360px;height:450px;transform:scale(0.2);transform-origin:top left;position:absolute">
                  <component :is="c.component" :seed-key="seedKey" :lens="lens" />
                </div>
              </div>
              <span class="thumb-label">{{ c.name }}</span>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div style="display:flex;flex-direction:column;gap:9px">
          <button class="btn fill" @click="download">⤓ Download image</button>
          <div class="btn-row">
            <button class="btn" @click="copyLink">{{ copied ? 'Copied!' : 'Copy link' }}</button>
            <button class="btn" @click="share">Post →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toPng } from 'html-to-image'
import { FLAVORS } from '../../../shared/flavors'
import ShareEditorial from './ShareEditorial.vue'
import ShareOrbit     from './ShareOrbit.vue'
import SharePoster    from './SharePoster.vue'

const mingo = useMingo()
const seedKey = computed(() => mingo.share.value!.seedKey)
const lens    = computed(() => mingo.share.value!.lens)
const label   = computed(() => FLAVORS[seedKey.value]?.label ?? seedKey.value)
const lensWord = computed(() => lens.value === 'classic' ? 'classic' : 'surprising')

const CARDS = [
  { key: 'poster',    name: 'Poster',    component: SharePoster },
  { key: 'editorial', name: 'Editorial', component: ShareEditorial },
  { key: 'orbit',     name: 'Orbit',     component: ShareOrbit },
]

const pick   = ref('poster')
const copied = ref(false)

const activeCard = computed(() => CARDS.find(c => c.key === pick.value)!.component)

const cardEl = ref<HTMLElement | null>(null)

async function download() {
  if (!import.meta.client) return
  await document.fonts.ready
  const el = document.querySelector('.card-inner-wrap') as HTMLElement | null
  if (!el) return
  const png = await toPng(el, { width: 360, height: 450, pixelRatio: 3 })
  const a   = Object.assign(document.createElement('a'), { href: png, download: `mingo-${seedKey.value}.png` })
  a.click()
  track('share_downloaded', { style: pick.value, seed: seedKey.value })
}

async function copyLink() {
  const url = `${window.location.origin}/genome/${seedKey.value}?lens=${lens.value}`
  await navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
  track('link_copied', { seed: seedKey.value })
}

async function share() {
  const url = `${window.location.origin}/genome/${seedKey.value}?lens=${lens.value}`
  if (navigator.share) {
    await navigator.share({ title: `${label.value} — Mingo`, url })
  } else {
    await copyLink()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
})
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') mingo.closeShare()
}
</script>

<style scoped>
.overlay-backdrop {
  position: fixed; inset: 0; z-index: 200;
  background: color-mix(in srgb, var(--ink) 62%, transparent);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px; animation: fadein .2s ease;
}
.overlay-panel {
  background: var(--paper); border-radius: 24px; padding: 30px;
  display: grid; grid-template-columns: auto 320px; gap: 34px;
  align-items: center; box-shadow: 0 40px 90px rgba(0,0,0,.4);
  max-width: 92vw; position: relative;
  animation: popin .26s cubic-bezier(.22,1,.36,1);
}
.close-btn {
  position: absolute; top: 16px; right: 16px;
  width: 34px; height: 34px; border-radius: 50%;
  border: 1.5px solid var(--line-2); background: var(--card);
  color: var(--ink); cursor: pointer; font-size: 16px; line-height: 1;
}
.card-inner-wrap {
  position: relative; border-radius: 18px; overflow: hidden;
  border: 1px solid var(--line-2); box-shadow: var(--shadow-md);
}
.controls { display: flex; flex-direction: column; gap: 18px; }
.thumb-btn {
  padding: 0; border: 1.5px solid var(--line-2); background: var(--card);
  border-radius: 10px; cursor: pointer; overflow: hidden;
  position: relative; width: 74px; flex: 0 0 74px;
}
.thumb-btn.active { border: 2px solid var(--ink); }
.thumb-label {
  position: absolute; left: 0; right: 0; bottom: 0;
  font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
  font-weight: 700; background: rgba(0,0,0,.45); color: #fff;
  padding: 2px 0; text-align: center;
}
.thumb-btn.active .thumb-label { background: var(--ink); }
@media (max-width: 639px) {
  .overlay-panel { grid-template-columns: 1fr; overflow-y: auto; max-height: 90vh; }
  .card-inner-wrap { width: 100%; aspect-ratio: 4/5; height: auto; }
}
</style>
