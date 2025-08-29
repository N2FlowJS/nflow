import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

// Normalized to 'agent-tools' (with hyphen) to align with FlowNode type definitions
export const plugin: NodePlugin = {
  name: 'agent-tools',
  match: (n) => n?.data?.type === 'agent-tools',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const
