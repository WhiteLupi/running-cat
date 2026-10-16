// A run of text in one color; a color is a theme key or a raw color.
export type Span = { text: string; color?: string; bg?: string }

// One row of a frame: plain text in the default color, or colored spans.
export type Row = string | readonly Span[]

// Rows the stage gives an animal; every frame stands on the bottom one.
export const HEIGHT = 6

// One frame of a sprite: rows top to bottom, at most HEIGHT of them.
export type Frame = readonly Row[]

// A looping run of frames, each held `every` ticks; `moves` walks it across the track.
export type Clip = { frames: readonly Frame[]; every: number; moves?: boolean }

export type Animal = {
  // The word `/running-cat <name>` takes.
  name: string
  // One line for the command's list.
  blurb: string
  // One per mode of the spinner.
  poses: {
    respond: Clip
    think: Clip
    wait: Clip
    // Phases a tool call cycles through, each held a few seconds.
    tool: readonly Clip[]
  }
  // The same frame with the eyes shut; it gets the frame as its clip holds it.
  blink: (frame: Frame) => Frame
  // Poses that now and then cut into any other, one picked per period.
  drama?: { clips: readonly Clip[]; ticks: number; period: number }
}
