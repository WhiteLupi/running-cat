import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import { ANIMALS, animalNamed } from './animals'
import { HEIGHT } from './animals/types'

const tool = atom({ plugin: 'running-cat', key: 'tool' } as const, null)
const pet = atom({ plugin: 'running-cat', key: 'animal' } as const, ANIMALS[0]!.name)
// Where the pick outlives the session.
const SAVED = 'animal'

const COMMAND = 'running-cat'

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// mcp__claude_ai_Slack__slack_send_message → Slack › send_message
export const shortName = (name: string) => {
  const mcp = /^mcp__(.+?)__(.+)$/.exec(name)
  if (!mcp) return name
  const server = mcp[1]!.replace(/^(claude_ai_|plugin_[^_]+_)/, '')
  const action = mcp[2]!.replace(new RegExp(`^${escape(server)}_`, 'i'), '')
  return `${server} › ${action}`
}

const menu = (current: string) =>
  ANIMALS.map(a => `${a.name === current ? '●' : '○'} ${a.name} — ${a.blurb}`).join('\n')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const [saved] = await Promise.all([
      $.store.get(SAVED),
      $.command.register({
        name: COMMAND,
        description: 'Pick the animal in place of the spinner',
        argumentHint: ANIMALS.map(a => a.name).join('|'),
        immediate: true,
      }),
    ])
    if (typeof saved === 'string') await update($, pet, () => animalNamed(saved).name)
    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const wanted = e.args.trim().toLowerCase()
    if (wanted === '') return { text: menu(await read($, pet)) }
    const animal = ANIMALS.find(a => a.name === wanted)
    if (!animal) return { text: `No ${wanted} here. Try one of:\n${menu(await read($, pet))}` }
    await update($, pet, () => animal.name)
    await $.store.set(SAVED, animal.name)
    return { text: `The ${animal.name} takes over the spinner.` }
  })

  on('tool.call', async ($, e, next) => {
    // A subagent's calls would overwrite the main loop's tool under the spinner.
    if (e.agentId === undefined) await update($, tool, () => shortName(e.tool))

    return next(e)
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (e.surface !== 'terminal' && e.surface !== 'desktop') {
      return next(e)
    }

    const { Box, Client, Text } = $.ui.resolve(e)
    const { mode, word, message, suffix } = e.props
    const usingTool = mode === 'tool-use' || mode === 'tool-input'
    const name = usingTool ? await read($, tool) : null
    const label = `${name ? `${name} · ` : ''}${message ?? word}${suffix}`
    const animal = await read($, pet)

    return (
      <Box flexDirection="column" width="100%">
        <Client key="pet" module="./stage.tsx" props={{ mode, word, animal }} width="100%" height={HEIGHT} />
        <Text dimColor>{label}</Text>
      </Box>
    )
  })
}
