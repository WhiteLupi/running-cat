import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const tool = atom({ plugin: 'running-cat', key: 'tool' } as const, null)

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// mcp__claude_ai_Slack__slack_send_message → Slack › send_message
export const shortName = (name: string) => {
  const mcp = /^mcp__(.+?)__(.+)$/.exec(name)
  if (!mcp) return name
  const server = mcp[1]!.replace(/^(claude_ai_|plugin_[^_]+_)/, '')
  const action = mcp[2]!.replace(new RegExp(`^${escape(server)}_`, 'i'), '')
  return `${server} › ${action}`
}

export const register: Register = on => {
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

    return (
      <Box flexDirection="column" width="100%">
        <Client key="cat" module="./cat.tsx" props={{ mode, word }} width="100%" height={6} />
        <Text dimColor>{label}</Text>
      </Box>
    )
  })
}
