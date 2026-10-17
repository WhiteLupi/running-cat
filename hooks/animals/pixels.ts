import type { Frame, Row, Span } from './types'

// The cat is plain text, drawn in the terminal's own color.
export const plain = (rows: readonly string[]): Frame => rows.map(text => [{ text }])

// A pixel grid: one string per pixel row, one letter per pixel, any letter
// missing from the palette (`.`, space) left empty.
export type Grid = readonly string[]

// Two pixel rows per terminal row: `▀` in the top pixel's color on the bottom's.
export const halfBlocks = (grid: Grid, palette: Readonly<Record<string, string>>): Frame => {
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

export const widthOf = (row: Row) => row.reduce((n, s) => n + s.text.length, 0)

// Text written into a frame: on row `row`, from column `col`.
export type Caption = { row: number; col: number; text: string }

export const caption = (frame: Frame, { row, col, text }: Caption): Frame =>
  frame.map((r, i) => (i === row ? [...r, { text: ' '.repeat(Math.max(0, col - widthOf(r))) + text }] : r))
