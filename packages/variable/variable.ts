import { NodePlugin } from '../@node-plugin/type'
import { executeVariableNode } from '../../utils/server/nodeExecution/node/executeVariableNode'

export const variablePlugin: NodePlugin = {
  name: 'variable',
  match: (n) => n?.data?.type === 'variable',
  run: (n, c, _cb, d) => executeVariableNode(n, c, d),
} as const
