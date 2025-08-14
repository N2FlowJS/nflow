import { NodePlugin } from '../@node-plugin/type'
import { executeSubAgentNode } from '../../utils/server/nodeExecution/node/executeSubAgentNode'

export const subAgentPlugin: NodePlugin = {
  name: 'subagent',
  match: (n) => n?.data?.type === 'subagent',
  run: (n, c, _cb, d) => executeSubAgentNode(n, c, d),
} as const
