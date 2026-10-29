// What a laptop needs, for any animal that types.
export const LAPTOP_COLORS = {
  G: '#9AA0AC', // laptop lid
  g: '#6B717E', // laptop base
  k: '#4A4F5A', // keys
  C: '#2B3A55', // screen
  c: '#7FD1FF', // code
  v: '#C7F07A', // code, another color
}

export const LAPTOP = ['.GGGGGGGG.', '.GCCCCCCG.', '.GCcvccCG.', '.GCccCCCG.', '.GCcvcCCG.', '.GCCCCCCG.', '.GGGGGGGG.', 'gkgkgkgkgg', 'gggggggggg']

// The flies of a session: the spider chases them, the frog eats them.
export const FLY_COLORS = {
  f: '#6A6A6A', // fly
  r: '#E04040', // fly's eye
  w: '#CFE8FF', // fly's wings
}

// Wings up, then out to the sides; the body holds still.
export const FLY = [['ww.ww', '.rff.'], ['.....', 'wrffw']]

// What the stage posts when a fly goes down.
export const FLY_EATEN = { eaten: 'fly' } as const

// Question marks piling up while an animal thinks, then gone.
export const QUESTIONS = ['?', '? ?', '? ? ?', '? ? ?', '']
