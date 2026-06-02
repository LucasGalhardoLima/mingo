/**
 * Pure-JS Epicure embedding loader.
 * Fetches safetensors + vocab from HF Hub on cold start; cached at module level.
 * 1790 × 300 float32 per model — ~2 MB each, ~5 ms per neighbors() call.
 */

const HF = 'https://huggingface.co/Kaikaku'
const HF_SPACE = 'https://huggingface.co/spaces/Kaikaku/epicure-explorer'

interface Model {
  E:         Float32Array   // L2-normalized, row-major [vocabSize × dModel]
  vocab:     Record<string, number>
  itos:      Record<number, string>
  vocabSize: number
  dModel:    number
}

// ── safetensors parser ────────────────────────────────────────────────────────

async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`epicure: fetch ${url} → ${res.status}`)
  return res.arrayBuffer()
}

function parseSafetensors(buf: ArrayBuffer): Float32Array {
  const view       = new DataView(buf)
  const headerLen  = Number(view.getBigUint64(0, true))
  const headerJson = new TextDecoder().decode(new Uint8Array(buf, 8, headerLen))
  const header     = JSON.parse(headerJson)
  const [start, end] = header['embeddings']['data_offsets'] as [number, number]
  const dataOffset = 8 + headerLen + start
  const byteLen    = end - start

  // Copy to guarantee alignment
  const aligned = new ArrayBuffer(byteLen)
  new Uint8Array(aligned).set(new Uint8Array(buf, dataOffset, byteLen))
  return new Float32Array(aligned)
}

function l2normalize(E: Float32Array, rows: number, cols: number): Float32Array {
  const out = new Float32Array(E.length)
  for (let i = 0; i < rows; i++) {
    let sq = 0
    const off = i * cols
    for (let j = 0; j < cols; j++) sq += (E[off + j] ?? 0) ** 2
    const inv = 1 / (Math.sqrt(sq) || 1e-9)
    for (let j = 0; j < cols; j++) out[off + j] = (E[off + j] ?? 0) * inv
  }
  return out
}

async function loadModel(schema: 'cooc' | 'chem'): Promise<Model> {
  const base = `${HF}/epicure-${schema}/resolve/main`
  const [emBuf, vocab] = await Promise.all([
    fetchBinary(`${base}/embeddings.safetensors`),
    fetch(`${base}/vocab.json`).then(r => r.json()) as Promise<Record<string, number>>,
  ])
  const raw       = parseSafetensors(emBuf)
  const vocabSize = Object.keys(vocab).length
  const dModel    = raw.length / vocabSize
  const E         = l2normalize(raw, vocabSize, dModel)
  const itos      = Object.fromEntries(Object.entries(vocab).map(([k, v]) => [v, k]))
  return { E, vocab, itos, vocabSize, dModel }
}

// ── food-group → axis mapping ─────────────────────────────────────────────────

const FG_AXIS: Record<string, string> = {
  Vegetable: 'g', Fruit: 'g',
  Grain: 'a', Dairy: 'a', Pantry: 'a',
  Spice: 'r', Beverage: 'r', Other: 'a',
}
const AXIS_OVERRIDES: Record<string, string> = {
  miso: 'r', soy_sauce: 'r', fish_sauce: 'r', vinegar: 'r',
  coffee: 'r', espresso: 'r', beer: 'r', wine: 'r',
  tahini: 'a', honey: 'a', cream: 'a',
  olive_oil: 'g', avocado: 'g', garlic: 'g', ginger: 'g',
}

async function loadFoodGroups(): Promise<Record<string, string>> {
  const url  = `${HF_SPACE}/resolve/main/ingredient_labels.json`
  const data = await fetch(url).then(r => r.json()) as { names: string[]; food_groups: string[] }
  const out: Record<string, string> = {}
  for (let i = 0; i < data.names.length; i++) {
    const name  = data.names[i]
    const group = data.food_groups[i]
    if (name && group) out[name] = group
  }
  return out
}

function axisFor(key: string, foodGroups: Record<string, string>): 'g' | 'a' | 'r' {
  if (key in AXIS_OVERRIDES) return AXIS_OVERRIDES[key] as 'g' | 'a' | 'r'
  return (FG_AXIS[foodGroups[key] ?? 'Other'] ?? 'a') as 'g' | 'a' | 'r'
}

// ── module-level singleton ────────────────────────────────────────────────────

let cooc: Model | null = null
let chem: Model | null = null
let foodGroups: Record<string, string> = {}
let initPromise: Promise<void> | null  = null

function ensureLoaded(): Promise<void> {
  if (cooc && chem) return Promise.resolve()
  if (initPromise) return initPromise
  initPromise = (async () => {
    console.log('[epicure] loading models…')
    ;[cooc, chem, foodGroups] = await Promise.all([
      loadModel('cooc'),
      loadModel('chem'),
      loadFoodGroups(),
    ])
    console.log(`[epicure] ready — ${cooc.vocabSize} ingredients × ${cooc.dModel}d`)
  })()
  return initPromise
}

// ── public API ────────────────────────────────────────────────────────────────

export type Match = { name: string; pct: number; axis: 'g' | 'a' | 'r'; sim: number }

function display(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function simToPct(sims: number[]): number[] {
  const lo = Math.min(...sims), hi = Math.max(...sims)
  const span = hi - lo || 0.01
  return sims.map(s => Math.round(73 + ((s - lo) / span) * 21))
}

function modelNeighbors(model: Model, seedIdx: number, k: number): Array<{ key: string; sim: number }> {
  const { E, vocabSize, dModel, itos } = model
  const off0 = seedIdx * dModel
  const scores = new Float32Array(vocabSize)

  for (let i = 0; i < vocabSize; i++) {
    let dot = 0
    const off = i * dModel
    for (let j = 0; j < dModel; j++) dot += (E[off + j] ?? 0) * (E[off0 + j] ?? 0)
    scores[i] = dot
  }
  scores[seedIdx] = -Infinity

  // Top-k
  const indices = Array.from({ length: vocabSize }, (_, i) => i)
  indices.sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
  return indices.slice(0, k).map(i => ({ key: itos[i] ?? '', sim: scores[i] ?? 0 }))
}

export async function getNeighbors(seed: string, k = 6): Promise<{
  classic: Match[]
  surprising: Match[]
} | null> {
  await ensureLoaded()
  const coocIdx = cooc!.vocab[seed]
  const chemIdx = chem!.vocab[seed]
  if (coocIdx === undefined) return null

  const coocNb = modelNeighbors(cooc!, coocIdx, k)
  const chemNb = modelNeighbors(chem!, chemIdx ?? coocIdx, k)

  const coocPcts = simToPct(coocNb.map(n => n.sim))
  const chemPcts = simToPct(chemNb.map(n => n.sim))

  return {
    classic:    coocNb.map((n, i) => ({ name: display(n.key), pct: coocPcts[i] ?? 80, axis: axisFor(n.key, foodGroups), sim: n.sim })),
    surprising: chemNb.map((n, i) => ({ name: display(n.key), pct: chemPcts[i] ?? 80, axis: axisFor(n.key, foodGroups), sim: n.sim })),
  }
}

export async function getVocab(): Promise<string[]> {
  await ensureLoaded()
  return Object.keys(cooc!.vocab)
}

export function vocabLoaded(): boolean {
  return cooc !== null
}
