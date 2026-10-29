import { HEIGHT } from './types'
import type { Frame, Row, Span } from './types'

// The cat is plain text, drawn in the terminal's own color.
export const plain = (rows: readonly string[]): Frame => rows.map(text => [{ text }])

// A pixel grid: one string per pixel row, one letter per pixel, any letter
// missing from the palette (`.`, space) left empty.
export type Grid = readonly string[]

// Letter to color.
export type Palette = Readonly<Record<string, string>>

// Two pixel rows per terminal row: `▀` in the top pixel's color on the bottom's.
export const halfBlocks = (grid: Grid, palette: Palette): Frame => {
  const lines = grid.length % 2 ? ['', ...grid] : grid
  const rows: Row[] = []
  for (let y = 0; y < lines.length; y += 2) {
    const top = lines[y]!
    const bottom = lines[y + 1]!
    const spans: Span[] = []
    const push = (span: Span) => {
      const last = spans.at(-1)
      if (last && last.color === span.color && last.bg === span.bg) last.text += span.text
      else spans.push(span)
    }
    for (let x = 0; x < Math.max(top.length, bottom.length); x++) {
      const t = palette[top[x] ?? '.']
      const b = palette[bottom[x] ?? '.']
      if (!t && !b) push({ text: ' ' })
      else if (!b) push({ text: '▀', color: t })
      else if (!t) push({ text: '▄', color: b })
      else if (t === b) push({ text: '█', color: t })
      else push({ text: '▀', color: t, bg: b })
    }
    // Blank spans hold spaces only; one at the end is padding.
    if (spans.at(-1)?.color === undefined) spans.pop()
    rows.push(spans)
  }
  return rows
}

// Puts `right` beside `left`, both standing on the bottom row.
export const beside = (left: Grid, right: Grid, gap = 0): Grid => {
  const height = Math.max(left.length, right.length)
  const lift = (g: Grid) => [...Array<string>(height - g.length).fill(''), ...g]
  const l = lift(left)
  const r = lift(right)
  const width = Math.max(...l.map(row => row.length))
  return l.map((row, i) => row.padEnd(width + gap, '.') + r[i])
}

// Grids laid on one stage-high canvas: each at column `x`, `lift` pixels off the
// floor (below it when negative, cut off there), later ones drawn over earlier ones.
export type Placed = { grid: Grid; x: number; lift?: number }
export const scene = (...placed: Placed[]): Grid => {
  const height = HEIGHT * 2
  const width = Math.max(...placed.map(p => p.x + Math.max(...p.grid.map(row => row.length))))
  const rows = Array.from({ length: height }, () => [...'.'.repeat(width)])
  for (const { grid, x, lift = 0 } of placed)
    grid.forEach((row, i) => {
      const line = rows[height - lift - grid.length + i]
      if (!line) return
      for (let j = 0; j < row.length; j++) if (row[j] !== '.') line[x + j] = row[j]!
    })
  return rows.map(row => row.join(''))
}

export const widthOf = (row: Row) => row.reduce((n, s) => n + s.text.length, 0)

// Text written into a frame: on row `row`, from column `col`.
export type Caption = { row: number; col: number; text: string }

export const caption = (frame: Frame, { row, col, text }: Caption): Frame =>
  frame.map((r, i) => (i === row ? [...r, { text: ' '.repeat(Math.max(0, col - widthOf(r))) + text }] : r))

// Paints grids in `palette`; each frame keeps a twin painted through `shut`, which
// `blink` hands back for the frame itself.
export const drawer = (
  palette: Palette,
  shut: (grid: Grid) => Grid,
): { draw: (grid: Grid, text?: Caption) => Frame; blink: (frame: Frame) => Frame } => {
  const twins = new Map<Frame, Frame>()
  const draw = (grid: Grid, text?: Caption): Frame => {
    const paint = (g: Grid) => {
      const frame = halfBlocks(g, palette)
      return text ? caption(frame, text) : frame
    }
    const open = paint(grid)
    twins.set(open, paint(shut(grid)))
    return open
  }
  return { draw, blink: (frame: Frame) => twins.get(frame) ?? frame }
}
