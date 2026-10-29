import { drawer, scene } from './pixels'
import type { Grid, Placed } from './pixels'
import { FLY, FLY_COLORS, LAPTOP, LAPTOP_COLORS, QUESTIONS } from './props'
import type { Animal, Clip } from './types'

const PALETTE = {
  B: '#5DBB4A', // skin
  D: '#2F7D32', // spots, the thighs from the front
  H: '#9BDB6A', // the thigh in the light
  L: '#EDE7A6', // throat and belly
  M: '#1E4F22', // the mouth line, eyes squeezed shut
  Y: '#E8C547', // the gold round the eyes
  E: '#111111', // pupils
  W: '#FFFFFF', // their glint
  T: '#F0607A', // tongue
  t: '#B83A5A', // its sticky tip
  A: '#2F6FBF', // pond
  a: '#7FB6F0', // ripples
  S: '#FFDCE6', // the croaking sac
  s: '#FFFFFF', // the shine on it
  ...FLY_COLORS,
  ...LAPTOP_COLORS,
}

// Lids down: the eyes go the color of the skin.
const { draw, blink } = drawer(PALETTE, grid => grid.map(row => row.replace(/[EW]/g, 'B')))

// Side on, facing right; the mouth ends a pixel short of the snout, at column 15.
const SIT = [
  '..........YYY...',
  '.........YEEWY..',
  '......BBBYEEEYB.',
  '...BBBDBBBYYYBBB',
  '..BBDBBBBBBBBBBB',
  '.BDBBBDBBBBMMMM.',
  '.BBBBBBBBLLLLL..',
  'BBHHBBBBLLLLL...',
  'BHHHBBBBBBL.....',
  '.BHBBBBBBBB.....',
  'BBB.BBBB.BBB....',
]
// Eyes squeezed shut and the throat bulging: down it goes.
const GULP = [
  ...SIT.slice(0, 3).map(row => row.replace(/[EW]/g, 'M')),
  ...SIT.slice(3, 6),
  '.BBBBBBBBLLLLLLL',
  'BBHHBBBBLLLLLLL.',
  ...SIT.slice(8),
]
// The jump, side on: squat, push off, fly out flat, front legs down to land.
const CROUCH = [
  ...SIT.slice(0, 2),
  '....BBBBBYEEEYB.',
  '..BBBBDBBBYYYBBB',
  '.BBDBBBBBBBBBBBB',
  'BDBBBDBBBBBMMMM.',
  'BBHHBBBBBLLLLL..',
  'BHHHBBBBLLLLLL..',
  'BBBBBBBBBBBBBBB.',
]
const TAKEOFF = [
  '.............YYY..',
  '............YEEWY.',
  '..........BBYEEEYB',
  '.......BBBBBBYYYBB',
  '.....BBDBBBBBBBBBB',
  '....BBBBBBBBBBMMM.',
  '...HHBBBBBLLLLL...',
  '..HHH.BBLLLL......',
  '.HH...............',
  'HH................',
  'H.................',
]
// Low and long, so the top of the leap keeps its eyes on the stage.
const STRETCH = [
  '...............YYY....',
  '..............YEEWY...',
  '...........BBBYEEEYB..',
  'HHH...BBBBBBBBBYYYBBB.',
  '.HHHHBBBDBBBBDBBBBBBBB',
  '....HHBBBBBBBBBBMMMMM.',
  '.......BBBLLLLLLLLLB..',
  '..............BB..BB..',
  '..............B...B...',
]
const DESCEND = [
  '..............YYY...',
  '.............YEEWY..',
  '..........BBBYEEEYB.',
  '......BBBBBBBBYYYBBB',
  'HH..BBBDBBBBBBBBBBBB',
  '.HHHBBBBBBBBBBMMMM..',
  '...HHBBBBBLLLLLL....',
  '.......BBLLLLLBB....',
  '............BB.BB...',
  '............B...B...',
]
// Face on: the eyes on top, a wide flat mouth, the thighs folded at the sides.
const FRONT = [
  '..YYY........YYY..',
  '.YEEWY......YEEWY.',
  '.YEEEYBBBBBBYEEEY.',
  '.BYYYBBBBBBBBYYYB.',
  '.BBBBBBBBBBBBBBBB.',
  '.BMBBBBBBBBBBBBMB.',
  '.BBMMMMMMMMMMMMBB.',
  '..BBBBLLLLLLBBBB..',
  '.DBBBLLLLLLLLBBBD.',
  'DDBB.BLLLLLLB.BBDD',
  'BBB.BBB....BBB.BBB',
]
// The sac under its chin blows up, then up some more.
const swell = (sac: readonly string[]) => [...FRONT.slice(0, 7), ...sac, ...FRONT.slice(7 + sac.length)]
const SWELLING = swell(['..BBSSSSSSSSSSBB..', '.DBSsSSSSSSSSSSBD.'])
const CROAKING = swell(['.BSSSSSSSSSSSSSSB.', 'BSSsSSSSSSSSSSSSSB', 'BSsSSSSSSSSSSSSSSB', '.BSSSSSSSSSSSSSSB.'])
// The glint moves over: it looks the other way.
const FRONT_LOOKING = FRONT.map(row => row.replace(/EEW/g, 'WEE'))

// Things at the corner of the mouth: canvas row 6, from column 15.
const MOUTH = { x: 15, lift: 5 }
const atMouth = (text: string): Placed => ({ grid: [text], ...MOUTH })
const tongue = (length: number) => 'T'.repeat(length - 1) + 't'
// The fly hovers level with the mouth; the tongue that reaches column 25 has it.
const FLY_AT = { x: 25, lift: MOUTH.lift }
const fly = (i: number): Placed => ({ grid: FLY[i % 2]!, ...FLY_AT })
const body = (grid: Grid, lift = 0): Placed => ({ grid, x: 0, lift })

// One jump, a frame a tick: [what's drawn, columns the stage moves it].
type Beat = readonly [placed: readonly Placed[], step: number]
const JUMP: readonly Beat[] = [
  [[body(CROUCH)], 0],
  [[body(TAKEOFF, 1)], 1],
  [[body(STRETCH, 3)], 3],
  [[body(STRETCH, 3)], 4],
  [[body(DESCEND, 2)], 3],
  [[body(CROUCH)], 3],
  [[body(SIT)], 0],
]

// The hunt: it sits, strikes, reels the fly in until only a wing sticks out of
// its mouth, swallows, and hops on. There is always another fly for the frog.
const SIT_FRAMES = 6
const STRIKE: readonly (readonly Placed[])[] = [
  [fly(SIT_FRAMES), atMouth(tongue(4))],
  [atMouth(tongue(11) + 'rff')],
  [atMouth(tongue(6) + 'rff')],
  [atMouth(tongue(2) + 'rf')],
  [atMouth('w')],
]
const HUNT: readonly Beat[] = [
  ...Array.from({ length: SIT_FRAMES }, (_, i): Beat => [[body(SIT), fly(i)], 0]),
  ...STRIKE.map((extra): Beat => [[body(SIT), ...extra], 0]),
  [[body(GULP)], 0],
  [[body(GULP)], 0],
  [[body(SIT)], 0],
  ...JUMP,
]
// The frame the fly goes down at: the first gulp.
const EATS = SIT_FRAMES + STRIKE.length

// Hops on, a pause on the ground between.
const HOPS: readonly Beat[] = [[[body(SIT)], 0], [[body(SIT)], 0], ...JUMP]

// It types with its tongue: down to one key, back in, down to another.
const LAPTOP_AT: Placed = { grid: LAPTOP, x: 19 }
// From the corner of the mouth (row 6) down to the keys (row 10).
const KEY_A = ['T.....', '.T....', '..T...', '...TT.', '.....t']
const KEY_B = ['TT......', '..T.....', '...TT...', '.....TT.', '.......t']
const TYPING = [KEY_A, null, KEY_B, null].map(tip =>
  scene(LAPTOP_AT, body(SIT), ...(tip ? [{ grid: tip, x: MOUTH.x, lift: 1 }] : [])),
)

// In the pond up to the brow, the ripples drifting by.
const RIPPLES = ['aAAAaAAAAAaaAAAAaAAAAa', 'AaAAAaAAAAAaaAAAAaAAAA', 'AAaAAAaAAAAAaaAAAAaAAA', 'AAAaAAAaAAAAAaaAAAAaAA']
const DEEP = 'A'.repeat(RIPPLES[0]!.length)
const POND = [...RIPPLES, ...RIPPLES].map((surface, i) =>
  scene({ grid: i < RIPPLES.length ? FRONT : FRONT_LOOKING, x: 2, lift: -4 }, { grid: [surface, DEEP, DEEP], x: 0 }),
)

const play = (beats: readonly Beat[], extra: Partial<Clip> = {}): Clip => ({
  frames: beats.map(([placed]) => draw(scene(...placed))),
  every: 1,
  steps: beats.map(([, step]) => step),
  ...extra,
})

const hunt = play(HUNT, { eats: EATS })
const hops = play(HOPS)
const typing: Clip = { frames: TYPING.map(g => draw(g)), every: 2 }

export const frog: Animal = {
  name: 'frog',
  blurb: "eats fly after fly with one flick of the tongue, none left for the spider, ponders face on, types with its tongue, hops, lies in the pond, eyes up, and croaks",
  poses: {
    respond: hunt,
    think: { frames: QUESTIONS.map(q => draw(scene(body(FRONT)), { row: 1, col: 20, text: q })), every: 5 },
    wait: { frames: POND.map(g => draw(g)), every: 3 },
    tool: [typing, hops, hunt, hops],
  },
  blink,
  // Now and then it turns to you and croaks, the sac under its chin blown up.
  drama: {
    clips: [
      {
        frames: [
          draw(scene(body(SWELLING))),
          ...[0, 1, 2].map(() => draw(scene(body(CROAKING)), { row: 1, col: 20, text: 'RIBBIT!' })),
          draw(scene(body(SWELLING))),
          draw(scene(body(FRONT))),
        ],
        every: 2,
      },
    ],
    ticks: 12,
    period: 100,
  },
}
