import type { ClientModule } from 'claude-code'

type Mode = 'requesting' | 'responding' | 'thinking' | 'tool-input' | 'tool-use'
type Pose = 'chase' | 'think' | 'tool' | 'wait'
type Props = { mode: Mode; word: string }
type Memory = { pose: Pose; since: number; x: number; jumpUntil: number }
type State = { tick: number; props: Props; memory: Memory }

const FRAME_MS = 140
const HOLD_TICKS = Math.round(3000 / FRAME_MS)
const JUMP_TICKS = 4
const WIDTH = 34

const POSE_OF: Record<Mode, Pose> = {
  thinking: 'think',
  responding: 'chase',
  'tool-use': 'tool',
  'tool-input': 'tool',
  requesting: 'wait',
}

const RUN = [
  ['         ▗▄  ▄▖ ', ' ▄       ▐▛██▜▌ ', ' ▝▚▄▟█████████▘ ', '    ██████████  ', '   ▗▛ ▜▖  ▗▛ ▜▖ '],
  ['         ▗▄  ▄▖ ', '         ▐▛██▜▌ ', '▀▀▀▄▟█████████▘ ', '    ██████████  ', '    ▐▌▐▌   ▐▌▐▌ '],
]
const MOUSE = [
  ['', '', '', '', '~~~▗██▙▖'],
  ['', '', '', '', '-~~▗██▙▖'],
]
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
  '           ▗▄  ▄▖',
  '  ▗▄▄▄▄▄▄▄▄▐▛██▜▌',
  ' ▐██████████████▌',
  '▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▘',
])

function at<T>(list: readonly T[], i: number): T {
  return list[i % list.length] as T
}

const blink = (rows: string[], tick: number) =>
  tick % 25 === 24 ? rows.map(r => r.replace('▐▛██▜▌', '▐████▌')) : rows

const HEIGHT = 6

// Every pose stands on the bottom row; spare rows go on top.
const ground = (rows: string[]) => [...Array<string>(Math.max(0, HEIGHT - rows.length)).fill(''), ...rows]

const chase = (step: number) => at(RUN, step).map((row, i) => row + '     ' + (at(MOUSE, step)[i] ?? ''))

const initial = (props: Props): State => ({
  tick: 0,
  props,
  memory: { pose: POSE_OF[props.mode] ?? 'chase', since: 0, x: 0, jumpUntil: 0 },
})

const isTyping = (m: Memory, tick: number) =>
  m.pose === 'tool' && Math.floor((tick - m.since) / HOLD_TICKS) % 2 === 1

// One frame forward: the pose follows the mode (held at least HOLD_TICKS), the cat runs.
const advance = (s: State, columns: number): State => {
  const tick = s.tick + 1
  let { pose, since, x, jumpUntil } = s.memory
  const wanted = POSE_OF[s.props.mode] ?? 'chase'
  if (wanted !== pose && tick - since >= HOLD_TICKS) {
    pose = wanted
    since = tick
  }
  const memory = { pose, since, x, jumpUntil }
  const moving = pose === 'chase' || (pose === 'tool' && !isTyping(memory, tick))
  const track = Math.max(1, columns - WIDTH)
  memory.x = moving ? (x + 1) % track : Math.min(x, track - 1)
  return { ...s, tick, memory }
}

const Cat: ClientModule<Props, State> = (props, surface) => {
  let s = surface.state
  if (s === undefined) {
    s = initial(props)
    surface.setState(s)
    surface.every(FRAME_MS, () => {
      if (surface.state) surface.setState(advance(surface.state, surface.columns))
    })
  } else if (props.mode !== s.props.mode || props.word !== s.props.word) {
    const jumpUntil = props.word !== s.props.word ? s.tick + JUMP_TICKS : s.memory.jumpUntil
    s = { ...s, props, memory: { ...s.memory, jumpUntil } }
    surface.setState(s)
  }

  const { tick, memory } = s
  let rows: string[]
  if (memory.pose === 'think') rows = at(THINK, Math.floor(tick / 5))
  else if (memory.pose === 'wait') rows = at(LOAF, Math.floor(tick / 4))
  else if (isTyping(memory, tick)) rows = at(LAPTOP, Math.floor(tick / 2))
  else rows = chase(tick % 2)
  rows = ground(rows)
  rows = blink(rows, tick)
  if (tick < memory.jumpUntil) rows = [...rows.slice(1), '']

  const pad = ' '.repeat(memory.x)
  const { Box, Text } = surface.elements

  return (
    <Box flexDirection="column">
      {rows.map((row, i) => (
        <Text key={String(i)} wrap="truncate">{pad + row}</Text>
      ))}
    </Box>
  )
}

export default Cat
