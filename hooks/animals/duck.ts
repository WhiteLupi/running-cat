import { beside, caption, halfBlocks } from './pixels'
import type { Grid } from './pixels'
import type { Animal, Clip, Frame } from './types'

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
  G: '#9AA0AC', // laptop lid
  g: '#6B717E', // laptop base
  k: '#4A4F5A', // keys
  C: '#2B3A55', // screen
  c: '#7FD1FF', // code
  v: '#C7F07A', // code, another color
  T: '#E8B66A', // crumb
  t: '#A8692C', // crust
}

// Each drawn frame keeps its twin with the eyes shut, for `blink`.
const shut = new Map<Frame, Frame>()
const draw = (grid: Grid, text?: { row: number; col: number; text: string }): Frame => {
  const paint = (g: Grid) => {
    const frame = halfBlocks(g, PALETTE)
    return text ? caption(frame, text.row, text.col, text.text) : frame
  }
  const open = paint(grid)
  shut.set(open, paint(grid.map(row => row.replace(/[WE]/g, 'Y'))))
  return open
}

const HEAD = ['.....YYYY......', '....YYYWEY.....', '....YYYKKYOOOO.', '....YPYYYYRRR..']
// The lower beak drops and the mouth shows.
const HEAD_QUACK = [...HEAD.slice(0, 3), HEAD[3]!.replace('RRR', 'MMM')]
const HEAD_NAP = HEAD.map(row => row.replace(/[WE]/g, 'Y'))
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
// Head down to the ground, beak in the bread.
const DIP = [
  '..............', '..............', '..............', '..............',
  'Y....YYYY.....', 'YY..YYYYYYY...', 'YYYYYYYYYYYY..', '.YYYYYYYYYYYY.',
  '..DYYYYYYD.YYYY', '...DDDDDD.YYWEY', '......O...YYKKYOOO', '......OO..YPYYYRRR',
]
const LAPTOP = ['.GGGGGGGG.', '.GCCCCCCG.', '.GCcvccCG.', '.GCccCCCG.', '.GCcvcCCG.', '.GCCCCCCG.', '.GGGGGGGG.', 'gkgkgkgkgg', 'gggggggggg']
const BREAD = ['.tttt.', 'tTTTTt', 'tTTTTt', 'tttttt']
const BITTEN = ['.T..t.', '......', '.tttt.', 'tTTTTt', 'tttttt']
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
  moves: true,
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
  blurb: 'waddles and quacks, ponders, pecks at a laptop and at bread, naps, and makes a scene',
  poses: {
    respond: quacking,
    think: { frames: ['?', '? ?', '? ? ?', '? ? ?', ''].map(q => draw(SIT, { row: 1, col: 16, text: q })), every: 5 },
    wait: { frames: ['z', 'z Z', 'z Z z', ''].map(z => draw(NAP, { row: 1, col: 16, text: z })), every: 5 },
    tool: [
      { frames: [draw(beside(SIT, LAPTOP)), draw(beside(PECK, LAPTOP))], every: 2 },
      walk,
      { frames: [draw(beside(STAND, BREAD, 1)), draw(beside(DIP, BITTEN))], every: 2 },
      walk,
    ],
  },
  blink: frame => shut.get(frame) ?? frame,
  drama: {
    clips: [
      { frames: [draw(TA_DA, { row: 2, col: 18, text: 'QUACK!' })], every: 1 },
      { frames: [draw(KNIFE)], every: 1 },
    ],
    ticks: 14,
    period: 100,
  },
}
