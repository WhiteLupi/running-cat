declare module 'claude-code' {
  interface PluginState {
    'running-cat': { tool: string | null; animal: string; fly: boolean }
  }
}
