import type { Animal, Frame } from './types'

const RUN = [
  ['         ▗▄  ▄▖ ', ' ▄       ▐▛██▜▌ ', ' ▝▚▄▟█████████▘ ', '    ██████████  ', '   ▗▛ ▜▖  ▗▛ ▜▖ '],
  ['         ▗▄  ▄▖ ', '         ▐▛██▜▌ ', '▀▀▀▄▟█████████▘ ', '    ██████████  ', '    ▐▌▐▌   ▐▌▐▌ '],
]
const MOUSE = [
  ['', '', '', '', '~~~▗██▙▖'],
  ['', '', '', '', '-~~▗██▙▖'],
]
const CHASE: Frame[] = RUN.map((run, step) => run.map((row, i) => row + '     ' + MOUSE[step]![i]))
const LOAF = [
  ['           ▗▄  ▄▖', '  ▗▄▄▄▄▄▄▄▄▐▛██▜▌', ' ▐██████████████▌', '▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▘'],
  ['           ▗▄  ▄▖', '  ▗▄▄▄▄▄▄▄▄▐▛██▜▌', '▗▐██████████████▌', '▝▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▘'],
]
// The laptop's keyboard sits just below the floor line, nearer the viewer; the paw taps it.
const LAPTOP = [
  ['           ▗▄  ▄▖', '  ▗▄▄▄▄▄▄▄▄▐▛██▜▌     ▗▄▄▄▄▄▄▖', ' ▐██████████████▌     ▐▓▒▓▓▒▓▌', '▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀███▄▟██████▙▖'],
  ['           ▗▄  ▄▖', '  ▗▄▄▄▄▄▄▄▄▐▛██▜▌     ▗▄▄▄▄▄▄▖', ' ▐██████████████▙▄▄▄▄ ▐▓▓▒▓▓▒▌', '▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▘ ▄▄▄▄▟██████▙▖'],
]
// A loaf with a fan of question marks over its head, popping up left, top, right.
const FAN = [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 1, 1], [0, 0, 0]] as const
const mark = (on: number) => (on ? '?' : ' ')
const THINK = FAN.map(([left, top, right]) => [
  `              ${mark(top)}`,
  `          ${mark(left)}       ${mark(right)}`,
  ...LOAF[0]!,
])

export const cat: Animal = {
  name: 'cat',
  blurb: 'chases a mouse, ponders, types on a tiny laptop, loafs',
  poses: {
    respond: { frames: CHASE, every: 1, moves: true },
    think: { frames: THINK, every: 5 },
    wait: { frames: LOAF, every: 4 },
    tool: [
      { frames: CHASE, every: 1, moves: true },
      { frames: LAPTOP, every: 2 },
    ],
  },
  blink: frame => frame.map(r => (typeof r === 'string' ? r.replace('▐▛██▜▌', '▐████▌') : r)),
}
