import { drawer, scene } from './pixels'
import type { Grid, Palette } from './pixels'
import { LAPTOP, LAPTOP_COLORS, QUESTIONS } from './props'
import type { Animal, Clip } from './types'

// Letters every spider shares; only the body colors differ.
const PROPS = {
  f: '#6A6A6A', // fly
  r: '#E04040', // fly's eye
  w: '#CFE8FF', // fly's wings
  J: '#3BD1C0', // fangs, the iridescent green
  j: '#1E9488', // fangs in shadow
  E: '#111111', // big front eyes
  W: '#FFFFFF', // their glint
  ...LAPTOP_COLORS,
}

const ORANGE = {
  ...PROPS,
  B: '#E8742A', // body
  D: '#A9481A', // body in shadow, the waist
  F: '#F8B878', // fuzz along the edges
  S: '#FFF3E0', // spots
  L: '#B85A20', // legs
  P: '#FFE6CC', // palps
  e: '#3A2A20', // the six small eyes
}

// Black on a dark terminal needs a lighter coat and glossy small eyes to show.
const BLACK = {
  ...PROPS,
  E: '#000000',
  B: '#3A3A46',
  D: '#25252D',
  F: '#7C7C8C',
  S: '#F4F4F4',
  L: '#6E6E7C',
  P: '#E8E8E8',
  e: '#9AAABE',
}

// Side on, facing right: abdomen with spots, waist, head with a big eye up front.
const BODY = [
  '..........FFFFF...',
  '.........FBeBBBF..',
  '..FFFF..DBBBBBBBF.',
  '.FBBBBFDBBBeBWEEF.',
  'FBSBBSBDBBBBBEEEF.',
  'BBBSSBBDBBBBBEEEFP',
  '.DBSBBDDBBBBBBJJP.',
]
// Two steps, the legs swapping places under the same hips.
const HIPS = '..DDDD.LLLLLLLJj..'
const LEGS = [
  [HIPS, '....L.L..L..L..L..', '...L..L..L..L...L.'],
  [HIPS, '...L.L..L..L..L...', '..L..L..L..L...L..'],
]
const STAND = [...BODY, ...LEGS[0]!]
const CROUCH = [...BODY, 'LLDDDDLLLLLLLLJjLL', 'L.................L']
// A front leg's tips, added to the ends of the rows from `from` down.
const reach = (grid: Grid, from: number, tips: readonly string[]): Grid =>
  grid.map((row, i) => row + (tips[i - from] ?? ''))
// In the air: front legs reach for the fly, the back ones trail.
const LEAP = [...reach(BODY, 4, ['LL', 'LLL', 'L']), 'LLDDDDLLLLLLLLJj', 'L.L.L']
// A front leg over the keys, a pixel up, then down to tap; the rest stand still.
const TYPING = [5, 6].map(from => reach(STAND, from, ['L', '.L', '..L']))
// Face on: two big eyes, a small one either side, two more on top; eight legs fanned out.
const FRONT = [
  '....................',
  '......FFFFFFFF......',
  '.....FBeBBBBeBF.....',
  '....FBBBBBBBBBBF....',
  '.L.FBBEEEBBEEEBBF.L.',
  '.LLBeBWEEBBWEEBeBLL.',
  'L.LBeBEEEBBEEEBeBL.L',
  'L.LBBBEEEBBEEEBBBL.L',
  'L.L.BBBEBBBBEBBB.L.L',
  'L.L.PBBJJBBJJBBP.L.L',
  'L..L.PBJJBBJJBP.L..L',
  'L..L...jj..jj...L..L',
]
// Courting: both front legs up from the shoulders, the tips waving out, then in.
const raise = (tip: number) =>
  FRONT.map((row, i) => {
    const cells = [...row]
    const last = cells.length - 1
    if (i >= 6) cells[0] = cells[last] = '.' // the outer legs leave the floor
    if (i >= 1 && i <= 4) cells[1] = cells[last - 1] = 'L'
    if (i === 0) cells[tip] = cells[last - tip] = 'L'
    return cells.join('')
  })
const DANCE = [raise(0), raise(2)]
// Wings up, then out to the sides; the body holds still.
const FLY = [['ww.ww', '.rff.'], ['.....', 'wrffw']]
// Pixels off the floor it hovers at.
const HOVER_LIFT = 6

// The hunt, one frame a tick: [pose, columns the stage moves it, pixels off the floor].
// It sits still, then covers the whole loop's track in one leap.
type Beat = readonly [grid: Grid, step: number, lift: number]
const HUNT: readonly Beat[] = [
  ...Array<Beat>(6).fill([STAND, 0, 0]),
  [CROUCH, 0, 0],
  [CROUCH, 0, 0],
  [LEAP, 2, 1],
  [LEAP, 3, 3],
  [LEAP, 3, 3],
  [LEAP, 3, 1],
  [CROUCH, 3, 0],
  [STAND, 0, 0],
]
const STEPS = HUNT.map(([, step]) => step)
// Columns leapt by each frame, and over the whole loop.
const HOPPED = STEPS.map((_, i) => STEPS.slice(0, i + 1).reduce((n, step) => n + step, 0))
const LEAP_COLUMNS = HOPPED.at(-1)!
// The fly hovers this far ahead and darts the whole leap away at the top of the arc,
// always just out of reach; held still on screen, it sits back in the frame as the
// spider moves.
const FLY_AHEAD = 24
const DART_AT = 9
const HUNTING = HUNT.map(([grid, , lift], i) => {
  const fly = { grid: FLY[i % 2]!, x: FLY_AHEAD + (i >= DART_AT ? LEAP_COLUMNS : 0) - HOPPED[i]!, lift: HOVER_LIFT }
  return scene({ grid, x: 0, lift }, fly)
})
// The leg is drawn over the laptop's edge, so the laptop goes down first.
const TYPING_AT_LAPTOP = TYPING.map(grid => scene({ grid: LAPTOP, x: 20 }, { grid, x: 0 }))

// Small steps back, then forward again, never leaving the spot.
const SHUFFLE = [3, 2, 1, 0, 0, 1, 2, 3].map((x, i) => scene({ grid: [...BODY, ...LEGS[i % 2]!], x }))

const build = (name: string, blurb: string, palette: Palette): Animal => {
  // Spiders don't blink; the glint in the big eyes goes out for a moment instead.
  const { draw, blink } = drawer(palette, grid => grid.map(row => row.replace(/W/g, 'E')))
  const hunt: Clip = { frames: HUNTING.map(g => draw(g)), every: 1, steps: STEPS }
  const shuffle: Clip = { frames: SHUFFLE.map(g => draw(g)), every: 2 }

  return {
    name,
    blurb,
    poses: {
      respond: hunt,
      think: { frames: QUESTIONS.map(q => draw(FRONT, { row: 1, col: 21, text: q })), every: 5 },
      wait: shuffle,
      tool: [
        { frames: TYPING_AT_LAPTOP.map(g => draw(g)), every: 2 },
        shuffle,
        hunt,
        shuffle,
      ],
    },
    blink,
    drama: { clips: [{ frames: DANCE.map(g => draw(g)), every: 2 }], ticks: 14, period: 100 },
  }
}

const BLURB = 'leaps at a fly and always misses, ponders with its eyes on you, types with a front leg, shuffles, and dances'

export const spider = build('spider', BLURB, ORANGE)
export const spiderBlack = build('spider-black', `${BLURB}; in black`, BLACK)
