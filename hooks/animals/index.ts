import { cat } from './cat'
import { duck } from './duck'
import { widthOf } from './pixels'
import type { Animal, Clip } from './types'

// Every animal the stage can draw; the first is the default. A new one is a file
// beside these and a line here.
export const ANIMALS: readonly Animal[] = [cat, duck]

// Every clip the animal can play.
export const clipsOf = (animal: Animal): Clip[] => {
  const { respond, think, wait, tool } = animal.poses
  return [respond, think, wait, ...tool, ...(animal.drama?.clips ?? [])]
}

// Columns each animal's widest frame takes, measured once.
const WIDTHS = new Map(
  ANIMALS.map(animal => [animal, Math.max(...clipsOf(animal).flatMap(c => c.frames.flatMap(f => f.map(widthOf))))]),
)

export const widthOfAnimal = (animal: Animal): number => WIDTHS.get(animal) ?? 0

export const animalNamed = (name: string | null | undefined): Animal =>
  ANIMALS.find(a => a.name === name) ?? ANIMALS[0]!
