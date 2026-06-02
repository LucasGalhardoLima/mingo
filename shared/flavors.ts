/* axis: 'g' whole/fresh · 'a' mid · 'r' processed/intense */

export type Axis = 'g' | 'a' | 'r'

export type Match = {
  name: string
  pct: number
  axis: Axis
  why: string
  note: string
}

export type Seed = {
  label: string
  classic: Match[]
  surprising: Match[]
}

export type SeedChip = { key: string; axis: Axis }

export const FLAVORS: Record<string, Seed> = {
  fig: {
    label: 'Fig',
    classic: [
      { name: 'Prosciutto',  pct: 94, axis: 'r', why: 'paired in 1,240 recipes · salty-sweet', note: '1,240 recipes' },
      { name: 'Goat cheese', pct: 88, axis: 'a', why: 'paired in 980 recipes · creamy tang',    note: '980 recipes'   },
      { name: 'Honey',       pct: 85, axis: 'a', why: '1,100 recipes · echoes fig sugar',        note: '1,100 recipes' },
      { name: 'Walnut',      pct: 81, axis: 'g', why: 'adds crunch & fat · 760 recipes',         note: '760 recipes'   },
      { name: 'Balsamic',    pct: 79, axis: 'a', why: 'acid lift, frequent in glazes',           note: '690 recipes'   },
      { name: 'Arugula',     pct: 76, axis: 'g', why: 'peppery green · 640 recipes',             note: '640 recipes'   },
    ],
    surprising: [
      { name: 'Blue cheese',    pct: 91, axis: 'r', why: 'shares 11 aroma compounds · funk + jam',   note: '11 compounds' },
      { name: 'Coffee',         pct: 84, axis: 'r', why: 'shares 9 compounds · roasty depth',         note: '9 compounds'  },
      { name: 'Vanilla',        pct: 82, axis: 'a', why: 'shares 8 compounds · warm vanillin',        note: '8 compounds'  },
      { name: 'Roasted almond', pct: 80, axis: 'g', why: 'shares 8 compounds · nutty + toasty',       note: '8 compounds'  },
      { name: 'Dark rum',       pct: 77, axis: 'r', why: 'shares 7 compounds · caramel + esters',     note: '7 compounds'  },
      { name: 'Black olive',    pct: 73, axis: 'g', why: 'shares 6 compounds · briny vs sweet',       note: '6 compounds'  },
    ],
  },
  coffee: {
    label: 'Coffee',
    classic: [
      { name: 'Milk',       pct: 93, axis: 'a', why: 'paired in 2,100 recipes · rounds bitterness', note: '2,100 recipes' },
      { name: 'Cane sugar', pct: 90, axis: 'a', why: '1,900 recipes · classic balance',             note: '1,900 recipes' },
      { name: 'Hazelnut',   pct: 86, axis: 'g', why: 'shared roasty notes · 880 recipes',           note: '880 recipes'   },
      { name: 'Cardamom',   pct: 83, axis: 'g', why: 'aromatic lift · 540 recipes',                 note: '540 recipes'   },
      { name: 'Cinnamon',   pct: 81, axis: 'g', why: 'warm spice · 610 recipes',                    note: '610 recipes'   },
      { name: 'Oat milk',   pct: 78, axis: 'a', why: 'creamy, low-dairy · 430 recipes',             note: '430 recipes'   },
    ],
    surprising: [
      { name: 'Dark chocolate', pct: 92, axis: 'r', why: 'shares 12 compounds · roasty pyrazines', note: '12 compounds' },
      { name: 'Blood orange',   pct: 81, axis: 'a', why: 'shares 8 compounds · bright citrus',      note: '8 compounds'  },
      { name: 'Rye bread',      pct: 78, axis: 'a', why: 'shares 7 compounds · malty crust',        note: '7 compounds'  },
      { name: 'Smoked paprika', pct: 75, axis: 'r', why: 'shares 6 compounds · smoke + heat',       note: '6 compounds'  },
      { name: 'Banana',         pct: 72, axis: 'g', why: 'shares 6 compounds · ester overlap',      note: '6 compounds'  },
      { name: 'Tonic water',    pct: 69, axis: 'r', why: 'shares 5 compounds · quinine bitter',     note: '5 compounds'  },
    ],
  },
  strawberry: {
    label: 'Strawberry',
    classic: [
      { name: 'Cream',        pct: 93, axis: 'a', why: 'paired in 1,700 recipes · soft fat',  note: '1,700 recipes' },
      { name: 'Shortcake',    pct: 88, axis: 'a', why: '1,300 recipes · buttery crumb',        note: '1,300 recipes' },
      { name: 'Basil',        pct: 85, axis: 'g', why: '860 recipes · green lift',             note: '860 recipes'   },
      { name: 'Balsamic',     pct: 83, axis: 'a', why: '740 recipes · sweet-acid',             note: '740 recipes'   },
      { name: 'Mint',         pct: 81, axis: 'g', why: '620 recipes · cooling',                note: '620 recipes'   },
      { name: 'Black pepper', pct: 78, axis: 'g', why: '520 recipes · gentle heat',            note: '520 recipes'   },
    ],
    surprising: [
      { name: 'Tomato',     pct: 85, axis: 'g', why: 'shares 9 compounds · ripe + green',    note: '9 compounds' },
      { name: 'Rose',       pct: 83, axis: 'g', why: 'shares 8 compounds · shared florals',  note: '8 compounds' },
      { name: 'Aged feta',  pct: 79, axis: 'r', why: 'shares 7 compounds · salt vs sweet',   note: '7 compounds' },
      { name: 'Coriander',  pct: 76, axis: 'g', why: 'shares 6 compounds · citrus-green',    note: '6 compounds' },
      { name: 'White choc', pct: 74, axis: 'r', why: 'shares 6 compounds · creamy vanillin', note: '6 compounds' },
      { name: 'Sherry',     pct: 71, axis: 'r', why: 'shares 5 compounds · oxidative depth', note: '5 compounds' },
    ],
  },
  basil: {
    label: 'Basil',
    classic: [
      { name: 'Tomato',     pct: 95, axis: 'g', why: 'paired in 2,400 recipes · the classic', note: '2,400 recipes' },
      { name: 'Mozzarella', pct: 90, axis: 'a', why: '1,800 recipes · milky calm',            note: '1,800 recipes' },
      { name: 'Garlic',     pct: 88, axis: 'g', why: '1,500 recipes · pungent base',          note: '1,500 recipes' },
      { name: 'Olive oil',  pct: 86, axis: 'g', why: '1,600 recipes · grassy fat',            note: '1,600 recipes' },
      { name: 'Lemon',      pct: 83, axis: 'g', why: '900 recipes · bright acid',             note: '900 recipes'   },
      { name: 'Pine nut',   pct: 80, axis: 'g', why: '780 recipes · pesto backbone',          note: '780 recipes'   },
    ],
    surprising: [
      { name: 'Strawberry', pct: 84, axis: 'g', why: 'shares 8 compounds · green + sweet',   note: '8 compounds' },
      { name: 'Peach',      pct: 82, axis: 'g', why: 'shares 7 compounds · summer esters',   note: '7 compounds' },
      { name: 'Watermelon', pct: 79, axis: 'g', why: 'shares 6 compounds · cooling',         note: '6 compounds' },
      { name: 'Coconut',    pct: 76, axis: 'g', why: 'shares 6 compounds · lactone overlap', note: '6 compounds' },
      { name: 'Vanilla',    pct: 73, axis: 'a', why: 'shares 5 compounds · soft sweetness',  note: '5 compounds' },
      { name: 'Dark choc',  pct: 70, axis: 'r', why: 'shares 5 compounds · herb + roast',    note: '5 compounds' },
    ],
  },
  miso: {
    label: 'Miso',
    classic: [
      { name: 'Rice',     pct: 92, axis: 'a', why: 'paired in 1,400 recipes · staple base', note: '1,400 recipes' },
      { name: 'Dashi',    pct: 89, axis: 'a', why: '1,200 recipes · umami stack',           note: '1,200 recipes' },
      { name: 'Scallion', pct: 87, axis: 'g', why: '1,000 recipes · sharp green',           note: '1,000 recipes' },
      { name: 'Sesame',   pct: 86, axis: 'g', why: '940 recipes · nutty oil',               note: '940 recipes'   },
      { name: 'Ginger',   pct: 84, axis: 'g', why: '820 recipes · warm bite',               note: '820 recipes'   },
      { name: 'Tofu',     pct: 82, axis: 'a', why: '1,100 recipes · mild canvas',           note: '1,100 recipes' },
    ],
    surprising: [
      { name: 'Caramel',      pct: 85, axis: 'r', why: 'shares 9 compounds · Maillard depth', note: '9 compounds' },
      { name: 'Maple',        pct: 82, axis: 'a', why: 'shares 8 compounds · roasty sweet',   note: '8 compounds' },
      { name: 'Butterscotch', pct: 80, axis: 'r', why: 'shares 7 compounds · buttery savor',  note: '7 compounds' },
      { name: 'Dark choc',    pct: 78, axis: 'r', why: 'shares 7 compounds · fermented edge', note: '7 compounds' },
      { name: 'Banana',       pct: 75, axis: 'g', why: 'shares 6 compounds · ester overlap',  note: '6 compounds' },
      { name: 'Espresso',     pct: 72, axis: 'r', why: 'shares 5 compounds · bitter-savory',  note: '5 compounds' },
    ],
  },
}

export const SEED_CHIPS: SeedChip[] = [
  { key: 'fig',        axis: 'r' },
  { key: 'basil',      axis: 'g' },
  { key: 'miso',       axis: 'r' },
  { key: 'coffee',     axis: 'r' },
  { key: 'strawberry', axis: 'g' },
]

export const STAPLE_ALIASES: Record<string, string[]> = {
  fig:        ['figs', 'black mission fig', 'dried fig', 'date', 'prune'],
  coffee:     ['espresso', 'latte', 'cold brew', 'mocha', 'cacao', 'cocoa', 'dark chocolate'],
  strawberry: ['strawberries', 'wild strawberry', 'raspberry', 'cherry', 'blackberry'],
  basil:      ['sweet basil', 'thai basil', 'genovese basil', 'holy basil', 'mint', 'oregano'],
  miso:       ['white miso', 'red miso', 'shiro miso', 'soy sauce', 'sea salt', 'maldon flakes', 'salt'],
}

export const NO_MATCH_TERMS: string[] = ['durian', 'natto', 'century egg', 'vegemite', 'marmite']

export const FLAVOR_EDGE = {
  noMatch: {
    label: 'Durian',
    cousins: [
      { name: 'Jackfruit',    axis: 'g' as Axis },
      { name: 'Mango',        axis: 'g' as Axis },
      { name: 'Shrimp paste', axis: 'r' as Axis },
    ],
  },
  oov: { typed: 'maldon flakes', mapped: 'Sea salt', axis: 'r' as Axis },
}
