import { NodePlugin } from '../@node-plugin/type'
import { executeConditionNode } from '../../utils/server/nodeExecution/node/executeConditionNode'

export const conditionPlugin: NodePlugin = {
  name: 'condition',
  match: (n) => n?.data?.type === 'condition',
  run: (n, c, _cb, d) => executeConditionNode(n, c, d),
} as const
