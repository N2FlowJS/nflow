import { NodePlugin } from '../@node-plugin/type'
import { executeSubAgentNode } from './execute'

export const subAgentPlugin: NodePlugin = {
  name: 'subagent',
  match: (n) => n?.data?.type === 'subagent',
  run: (n, c, _cb, d) => executeSubAgentNode(n, c, d),
} as const
