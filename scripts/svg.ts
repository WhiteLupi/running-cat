// Draws an animal's README picture from its real frames: `bun scripts/svg.ts frog > assets/frog.svg`.
import { ANIMALS, widthOfAnimal } from '../hooks/animals'
import type { Animal, Clip, Frame } from '../hooks/animals/types'

const PIXEL = 8
const COLUMNS = 64
const FRAME_MS = 140

// The story the picture tells: each clip played for so many ticks, one after another.
const story = (animal: Animal): [Clip, number][] => {
  const { respond, think, wait, tool } = animal.poses
  return [
    [respond, respond.frames.length * respond.every],
    [think, 20],
    [tool[0]!, 16],
    [tool[1]!, 9],
    [wait, 24],
    ...animal.drama!.clips.map((clip): [Clip, number] => [clip, clip.frames.length * clip.every]),
    [respond, respond.frames.length * respond.every],
  ]
}

// A frame as SVG: runs of one color as rects, text as text, two pixel rows to a row.
const group = (id: number, frame: Frame) => {
  const pixels = new Map<string, string>()
  const texts: string[] = []
  const pad = 6 - frame.length
  frame.forEach((row, r) => {
    let col = 0
    for (const { text, color, bg } of row)
      for (const ch of text) {
        const y = (pad + r) * 2
        const [top, bottom] = ch === '█' ? [color, color] : ch === '▀' ? [color, bg] : ch === '▄' ? [undefined, color] : []
        if (ch !== ' ' && !'█▀▄'.includes(ch)) texts.push(`<text x="${col * PIXEL + 4}" y="${y * PIXEL + 12}">${ch}</text>`)
        if (top) pixels.set(`${y},${col}`, top)
        if (bottom) pixels.set(`${y + 1},${col}`, bottom)
        col++
      }
  })
  const rects: string[] = []
  for (let y = 0; y < 12; y++)
    for (let x = 0; x < COLUMNS * 2; x++) {
      const color = pixels.get(`${y},${x}`)
      if (!color) continue
      let end = x
      while (pixels.get(`${y},${end + 1}`) === color) end++
      rects.push(`<rect x="${x * PIXEL}" y="${y * PIXEL}" width="${(end - x + 1) * PIXEL}" height="${PIXEL}" fill="${color}"/>`)
      x = end
    }
  return `<g id="f${id}">${rects.join('')}${texts.join('')}</g>`
}

const svg = (animal: Animal, alt: string) => {
  // Frames that look the same are drawn once, whichever clip they come from.
  const frames: Frame[] = []
  const ids = new Map<string, number>()
  const timeline: [frame: number, x: number][] = []
  const track = COLUMNS - widthOfAnimal(animal)
  let x = 0
  for (const [clip, ticks] of story(animal))
    for (let t = 0; t < ticks; t++) {
      const i = Math.floor(t / clip.every) % clip.frames.length
      const frame = clip.frames[i]!
      const key = JSON.stringify(frame)
      if (!ids.has(key)) ids.set(key, frames.push(frame) - 1)
      timeline.push([ids.get(key)!, x])
      if (clip.steps) x = (x + clip.steps[i % clip.steps.length]!) % track
    }
  const total = timeline.length * FRAME_MS
  const shown = +((100 * FRAME_MS) / total).toFixed(4)
  // What a reader who asked for less motion sees: the thinking pose.
  const [still, stillX] = timeline[story(animal)[0]![1] + 1]!
  const use = (cls: string, n: number, at: number, style: string) =>
    `<use class="${cls}" href="#f${n}" xlink:href="#f${n}" x="${at * PIXEL}" style="${style}"/>`
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="544" height="128" viewBox="0 0 544 128" role="img" aria-label="${alt}">`,
    '<style>',
    `.k{opacity:0;animation:k ${total}ms step-end infinite}`,
    `@keyframes k{0%{opacity:1}${shown}%{opacity:0}100%{opacity:0}}`,
    'text{font:bold 15px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#fff;text-anchor:middle}',
    '@media (prefers-reduced-motion:reduce){.k{animation:none}.still{opacity:1}}',
    '</style>',
    '<defs>',
    '<clipPath id="c"><rect x="16" y="16" width="512" height="96"/></clipPath>',
    ...frames.map((frame, n) => group(n, frame)),
    '</defs>',
    '<rect width="544" height="128" rx="10" fill="#262b36"/>',
    '<g clip-path="url(#c)"><g transform="translate(16 16)">',
    use('still', still, stillX, 'opacity:0'),
    ...timeline.map(([n, at], i) => use('k', n, at, `animation-delay:-${total - i * FRAME_MS}ms`)),
    '</g></g>',
    '</svg>',
    '',
  ].join('\n')
}

const ALT: Record<string, string> = {
  frog: 'running-cat frog: a pixel frog flicks its tongue at a fly and swallows it, ponders face on, types with its tongue, hops, lies in the pond with only its eyes up, and croaks',
}

const name = process.argv[2] ?? ''
const animal = ANIMALS.find(a => a.name === name)
if (!animal?.drama || !ALT[name]) {
  console.error(`Usage: bun scripts/svg.ts <${Object.keys(ALT).join('|')}>`)
  process.exit(1)
}
process.stdout.write(svg(animal, ALT[name]!))
