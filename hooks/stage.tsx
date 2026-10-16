import type { ClientModule, RenderPropsOf } from 'claude-code'
import { HEIGHT, animalNamed, widthOfAnimal } from './animals'
import type { Animal, Clip, Frame, Row } from './animals/types'

type Mode = RenderPropsOf['Spinner']['mode']
type Mood = keyof Animal['poses']
type Props = { mode: Mode; word: string; animal: string }
type Memory = { mood: Mood; since: number; x: number; jumpUntil: number }
type State = { tick: number; props: Props; memory: Memory }

const FRAME_MS = 140
const HOLD_TICKS = Math.round(3000 / FRAME_MS)
const JUMP_TICKS = 4

const MOOD_OF: Record<Mode, Mood> = {
  thinking: 'think',
  responding: 'respond',
  'tool-use': 'tool',
  'tool-input': 'tool',
  requesting: 'wait',
}

// A mode the engine adds later runs, as the cat chased before.
const moodOf = (mode: Mode): Mood => MOOD_OF[mode] ?? 'respond'

function at<T>(list: readonly T[], i: number): T {
  return list[i % list.length] as T
}

// Every pose stands on the bottom row; spare rows go on top.
const ground = (rows: Frame): Row[] => [...Array<Row>(Math.max(0, HEIGHT - rows.length)).fill([]), ...rows]

// A number that looks random but is the same for the same `n` on every redraw.
const scramble = (n: number, salt: number) => ((n + salt) * 2654435761) >>> 0

// The drama under way at `tick`, if any. Within each period it starts at its own
// spot and picks its own clip, so it never feels on a timer.
const dramaAt = (animal: Animal, tick: number): Clip | undefined => {
  if (!animal.drama) return undefined
  const { clips, period, ticks } = animal.drama
  const cycle = Math.floor(tick / period)
  const start = scramble(cycle, 1) % Math.max(1, period - ticks)
  const t = tick % period
  return t >= start && t < start + ticks ? at(clips, scramble(cycle, 2) >>> 8) : undefined
}

// The clip the animal plays: a drama, else the mood's; a tool call steps
// through its phases every HOLD_TICKS.
const clipAt = (animal: Animal, m: Memory, tick: number): Clip => {
  const drama = dramaAt(animal, tick)
  if (drama) return drama
  if (m.mood === 'tool') return at(animal.poses.tool, Math.floor((tick - m.since) / HOLD_TICKS))
  return animal.poses[m.mood]
}

const initial = (props: Props): State => ({
  tick: 0,
  props,
  memory: { mood: moodOf(props.mode), since: 0, x: 0, jumpUntil: 0 },
})

// One frame forward: the mood follows the mode (held at least HOLD_TICKS), the animal runs.
const advance = (s: State, columns: number): State => {
  const tick = s.tick + 1
  const animal = animalNamed(s.props.animal)
  let { mood, since, x, jumpUntil } = s.memory
  const wanted = moodOf(s.props.mode)
  if (wanted !== mood && tick - since >= HOLD_TICKS) {
    mood = wanted
    since = tick
  }
  const memory = { mood, since, x, jumpUntil }
  const moving = clipAt(animal, memory, tick).moves ?? false
  const track = Math.max(1, columns - widthOfAnimal(animal))
  memory.x = moving ? (x + 1) % track : Math.min(x, track - 1)
  return { ...s, tick, memory }
}

const Stage: ClientModule<Props, State> = (props, surface) => {
  let s = surface.state
  if (s === undefined) {
    s = initial(props)
    surface.setState(s)
    surface.every(FRAME_MS, () => {
      if (surface.state) surface.setState(advance(surface.state, surface.columns))
    })
  } else if (props.mode !== s.props.mode || props.word !== s.props.word || props.animal !== s.props.animal) {
    const jumpUntil = props.word !== s.props.word ? s.tick + JUMP_TICKS : s.memory.jumpUntil
    s = { ...s, props, memory: { ...s.memory, jumpUntil } }
    surface.setState(s)
  }

  const { tick, memory } = s
  const animal = animalNamed(s.props.animal)
  const clip = clipAt(animal, memory, tick)
  let frame = at(clip.frames, Math.floor(tick / clip.every))
  if (tick % 25 === 24) frame = animal.blink(frame)
  let rows = ground(frame)
  if (tick < memory.jumpUntil) rows = [...rows.slice(1), []]

  const pad = ' '.repeat(memory.x)
  const { Box, Text } = surface.elements

  return (
    <Box flexDirection="column">
      {rows.map((row, i) => (
        <Text key={String(i)} wrap="truncate">
          {pad}
          {row.map((span, j) => (
            <Text key={String(j)} color={span.color} backgroundColor={span.bg}>{span.text}</Text>
          ))}
        </Text>
      ))}
    </Box>
  )
}

export default Stage
