import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

// Normalized to 'agenttools' (no hyphen) to align with FlowNode type definitions
export const plugin: NodePlugin = {
  name: 'agenttools',
  match: (n) => n?.data?.type === 'agenttools',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const
