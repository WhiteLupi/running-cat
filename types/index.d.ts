export type ToolName = string

declare module 'claude-code' {
  interface PluginState {
    'running-cat': { tool: ToolName | null }
  }
}
