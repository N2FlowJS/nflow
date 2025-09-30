import { NodePlugin } from '../@node-plugin/type'
import { executeAgentNode } from './executeAgentNode'

export const agentPlugin: NodePlugin = {
  name: 'agent',
  match: (n) => (n as any)?.data?.type === 'agent',
  run: (n, c, _cb, d) => executeAgentNode(n as any, c, d),
} as const
