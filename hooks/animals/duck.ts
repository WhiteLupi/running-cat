import { beside, drawer } from './pixels'
import type { Grid } from './pixels'
import { LAPTOP, LAPTOP_COLORS, QUESTIONS } from './props'
import { WALK } from './types'
import type { Animal, Clip } from './types'

const PALETTE = {
  Y: '#FFD43B', // feathers
  D: '#F0A80E', // feathers in shadow
  O: '#FF8A1F', // beak, near foot
  R: '#E86A10', // lower beak, far foot
  M: '#8E2A1E', // inside the open beak
  K: '#1A1A1A', // eye
  E: '#1A1A1A', // eye, the half a blink covers
  W: '#FFFFFF', // the eye's glint
  P: '#FF9AA2', // blush
  S: '#D7DCEB', // blade
  B: '#7A4320', // handle
  ...LAPTOP_COLORS,
  w: '#FF8FA3', // worm
  n: '#D9667E', // worm's rings and head
}

// `W` and `E` are the part of the eye a lid covers.
const closeEyes = (grid: Grid): Grid => grid.map(row => row.replace(/[WE]/g, 'Y'))

const { draw, blink } = drawer(PALETTE, closeEyes)

const HEAD = ['.....YYYY......', '....YYYWEY.....', '....YYYKKYOOOO.', '....YPYYYYRRR..']
// The lower beak drops and the mouth shows.
const HEAD_QUACK = [...HEAD.slice(0, 3), HEAD[3]!.replace('RRR', 'MMM')]
const HEAD_NAP = closeEyes(HEAD)
// The tail tips up, then lies back.
const TAILS = [
  ['Y....YYYY......', 'YY..YYYYYY.....', 'YYYYYYYYYYY....'],
  ['.....YYYY......', 'YYY.YYYYYY.....', 'YYYYYYYYYYY....'],
]
const TAIL_QUACK = (tail: Grid) => [tail[0]!.slice(0, 9) + 'RRR...', ...tail.slice(1)]
const BELLY = ['.YYYYYYYYYY....', '..DYYYYYYD.....', '...DDDDDD......']
// Sitting, the toes peek out in front.
const BELLY_SIT = ['.YYYYYYYYYY....', '..DYYYYYYD.....', '...DDDDDDOOO...']
// Stride, pass, the other stride, pass; the far leg is the darker one.
const LEGS = [
  ['....R...O......', '....RR..OO.....'],
  ['......O........', '......OO.......'],
  ['....O...R......', '....OO..RR.....'],
  ['......O........', '......OO.......'],
]

const SIT = [...HEAD, ...TAILS[0]!, ...BELLY_SIT]
const NAP = [...HEAD_NAP, ...TAILS[0]!, ...BELLY_SIT]
const STAND = [...HEAD, ...TAILS[0]!, ...BELLY, ...LEGS[1]!]
// Head lowered, beak at the screen.
const PECK = ['......YYYY.....', '.....YYYWEY....', '.....YYYKKYOOOO', 'Y....YPYYYYRRR.', 'YY..YYYYYY.....', 'YYYYYYYYYYY....', ...BELLY_SIT]
// Head down to the ground, beak at the worm.
const DIP = [
  '..............', '..............', '..............', '..............',
  'Y....YYYY.....', 'YY..YYYYYYY...', 'YYYYYYYYYYYY..', '.YYYYYYYYYYYY.',
  '..DYYYYYYD.YYYY', '...DDDDDD.YYWEY', '......O...YYKKYOOO', '......OO..YPYYYRRR',
]
// It inches along: arched, then flat; caught, its tail flips up.
const WORM = [
  ['...wnww...', '..wn..ww..', '.nw....wn.', 'nw......ww'],
  ['.wwnwwnww.', 'nwwnwwnwww'],
]
const CAUGHT = ['.......ww', '......ww.', '.wwnwwww.', 'nwwnwww..']
const KNIFE = [
  '....................SS', '.....YYYY..........SS.', '....YYYYYY........SS..', '....YYYKKY.......SS...',
  '....YYYYYYOOOO..SS....', '....YPYYYYRRR..BB.....', 'Y....YYYY.....BB......', 'YY..YYYYYYYYYYB.......',
  'YYYYYYYYYYY...........', '.YYYYYYYYYY...........', '..DYYYYYYD............', '...DDDDDDOOO..........',
]
// Turned to the camera, wings up.
const TA_DA = [
  'Y....YYYYYY....Y', 'YY..YYYYYYYY..YY', '.YY.YWEYYWEY.YY.', '..YYYKKYYKKYYY..',
  '...YYPYOOYPYY...', '....YYOOOOYY....', '....YYYRRYYY....', '....YYYYYYYY....',
  '....DYYYYYYD....', '.....DDDDDD.....', '.....O....O.....', '....OO....OO....',
]

// Sixteen steps, the tail wagging every other.
const walk: Clip = {
  frames: Array.from({ length: 16 }, (_, i) => draw([...HEAD, ...TAILS[i % 2]!, ...BELLY, ...LEGS[i % 4]!])),
  every: 2,
  steps: WALK,
}
// The same, the beak opening on the last two steps.
const quacking: Clip = {
  ...walk,
  frames: walk.frames.map((frame, i) =>
    i < 14 ? frame : draw([...HEAD_QUACK, ...TAIL_QUACK(TAILS[i % 2]!), ...BELLY, ...LEGS[i % 4]!]),
  ),
}

export const duck: Animal = {
  name: 'duck',
  blurb: 'waddles and quacks, ponders, pecks at a laptop and at a worm, naps, and makes a scene',
  poses: {
    respond: quacking,
    think: { frames: QUESTIONS.map(q => draw(SIT, { row: 1, col: 16, text: q })), every: 5 },
    wait: { frames: ['z', 'z Z', 'z Z z', ''].map(z => draw(NAP, { row: 1, col: 16, text: z })), every: 5 },
    tool: [
      { frames: [draw(beside(SIT, LAPTOP)), draw(beside(PECK, LAPTOP))], every: 2 },
      walk,
      {
        frames: [...[...WORM, ...WORM].map(worm => draw(beside(STAND, worm, 1))), draw(beside(DIP, CAUGHT))],
        every: 2,
      },
      walk,
    ],
  },
  blink,
  drama: {
    clips: [
      { frames: [draw(TA_DA, { row: 2, col: 18, text: 'QUACK!' })], every: 1 },
      { frames: [draw(KNIFE)], every: 1 },
    ],
    ticks: 14,
    period: 100,
  },
}
