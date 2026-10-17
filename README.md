# running-cat 🐈‍⬛

<img src="assets/kitten.svg" alt="running-cat: a pixel kitten chases a mouse, thinks, types on a tiny laptop, then loafs and flicks its tail" width="544">

> *"I used to stare at a spinner. Now I stare at a cat. My life has meaning."*
> — a developer, probably

The Claude Code spinner had one job: spin. It did that job. Nobody loved it.

**running-cat** replaces it with a kitten who actually cares about your work:

- 🐭 **Claude is answering** → the kitten chases a mouse across your terminal. It will never catch it. Neither will you catch that bug, but at least you have company.
- ❓ **Claude is thinking** → the kitten loafs while question marks pop up over its head, one, two, three. Deep thoughts. Possibly about tuna.
- 💻 **A tool is running** → the kitten runs a bit, then sits down at a tiny laptop and types, and back again. The line below tells you exactly which tool it's using (`Bash · Running…`, `Tool › do_something · …`).
- 🍞 **Waiting for the reply** → the kitten loafs and flicks its tail.
- 🐾 **New spinner word** → the kitten hops.
- 😺 **It blinks.** Every 3.5 seconds. You're welcome.

## Not a cat person?

```
/running-cat duck
```

<img src="assets/duck.svg" alt="running-cat duck: a pixel rubber duck waddles and quacks, ponders, pecks at a laptop and at a worm, makes a scene, naps, and produces a knife" width="544">

- 🦆 **Claude is answering** → the duck waddles across your terminal, wagging its tail like it just shipped to prod on a Friday. Every few steps it quacks. Nobody asked it to. It quacks anyway. It is the only one on the team who reads the logs out loud.
- ❓ **Claude is thinking** → the duck sits down and stares into the middle distance while question marks pile up. It is not thinking about your code. It is thinking about the bread, which it has been told it cannot have. No, seriously. Don't give bread to ducks. It kills them.
- 💻 **A tool is running** → the duck pecks at a laptop, waddles off, hunts down a worm, waddles back. Rubber duck debugging, finally literal. It types with its face. So do you, at 2 a.m. The worm did not consent to being part of your CI pipeline.
- 💤 **Waiting for the reply** → the duck naps. `z Z z`. It has earned this. You have not.
- 🎭 **Now and then, for no reason at all** → the duck turns to face the camera, throws its wings in the air and screams *QUACK!* Other times it quietly produces a knife and meditates on it. We don't know where the knife came from. We don't know where it goes. The duck does not explain itself, and neither will we.
- 😑 **It blinks.** Slowly. It has seen your vibe-code

`/running-cat` lists the animals. `/running-cat cat` brings the kitten back, if you can live with the duck knowing. The pick sticks across sessions. Ducks remember.

### Frequently asked questions

**Is the duck safe?** The duck is safe. The duck is always safe. Please stop asking about the knife.

**Can I give it bread?** No.

**Does it float?** It's a rubber duck. Of course it floats. It just chooses not to.

**Where did the worm go?** Don't.

## Scientifically proven benefits

| Metric | Before | After |
| --- | --- | --- |
| Developer happiness | 41% | **97%** |
| Times you said "aww" per day | 0 | **38** |
| Bugs fixed while watching the cat | 12 | **12** (but happier) |
| Rogue tool calls stopped in time | 3 | **27** |
| Spinners that were jealous | 0 | **1** |
| Productive meetings | 2 | 2 (the cat can't fix everything) |

In a double-blind study, 9 out of 10 developers preferred the kitten. The tenth was a dog person and has been excluded from all future studies.

Teams that installed running-cat report a **340% increase** in "wait, come look at this" moments and a **100% decrease** in staring at a sad rotating asterisk.

## Install

Needs a Claude Code build with plugin hooks modules (2.1.289 or newer). Works in the terminal; the desktop app keeps its own spinner.

```
/plugin marketplace add whiteLupi/running-cat
/plugin install running-cat@running-cat
```

Then `/reload-plugins` or restart, and wait for Claude to think. The kitten will be there.

---

*All numbers above were made up. The kitten is still cute. That part is real.*
