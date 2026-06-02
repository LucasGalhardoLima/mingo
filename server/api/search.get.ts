import { getVocab, vocabLoaded } from '../utils/epicure'

export default defineEventHandler(async (event) => {
  const q = (getQuery(event).q as string ?? '').trim().toLowerCase().replace(/\s+/g, '_')

  const vocab = await getVocab()

  if (!q) {
    // Return a curated default list when query is empty
    const defaults = ['fig', 'coffee', 'basil', 'miso', 'strawberry', 'garlic', 'lemon', 'ginger']
    return defaults.map(toResult)
  }

  const matches = vocab
    .filter(k => k.startsWith(q) || k.includes(q))
    .sort((a, b) => {
      // Exact prefix match first
      const aPrefix = a.startsWith(q) ? 0 : 1
      const bPrefix = b.startsWith(q) ? 0 : 1
      return aPrefix - bPrefix || a.length - b.length
    })
    .slice(0, 10)

  return matches.map(toResult)
})

function toResult(key: string) {
  return {
    key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  }
}
