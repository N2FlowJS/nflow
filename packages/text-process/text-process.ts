import { NodePlugin } from '../@node-plugin/type'
import { executeTextProcessNode } from '../../utils/server/nodeExecution/node/executeTextProcessNode'

export const textProcessPlugin: NodePlugin = {
  name: 'text-process',
  match: (n) => n?.data?.type === 'text-process',
  run: (n, c, _cb, d) => executeTextProcessNode(n, c, d),
} as const
