import { NodePlugin } from '../@node-plugin/type'
import { executeMathNode } from '../../utils/server/nodeExecution/node/executeMathNode'

export const mathPlugin: NodePlugin = {
  name: 'math',
  match: (n) => n?.data?.type === 'math',
  run: (n, c, _cb, d) => executeMathNode(n, c, d),
} as const
