import { NodePlugin } from '../@node-plugin/type'
import { executeAgentNode } from './executeAgentNode'

export const agentPlugin: NodePlugin = {
  name: 'agent',
  match: (n) => n?.data?.type === 'agent',
  run: (n, c, _cb, d) => executeAgentNode(n, c, d),
} as const
