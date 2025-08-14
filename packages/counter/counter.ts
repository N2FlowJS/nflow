import { NodePlugin } from '../@node-plugin/type'
import { executeCounterNode } from '../../utils/server/nodeExecution/node/executeCounterNode'

export const counterPlugin: NodePlugin = {
  name: 'counter',
  match: (n) => n?.data?.type === 'counter',
  run: (n, c, _cb, d) => executeCounterNode(n, c, d),
} as const
