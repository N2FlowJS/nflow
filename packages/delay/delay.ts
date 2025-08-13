import { NodePlugin } from '../@node-plugin/type'
import { executeDelayNode } from '../../utils/server/nodeExecution/node/executeDelayNode'

export const delayPlugin: NodePlugin = {
  name: 'delay',
  match: (n) => n?.data?.type === 'delay',
  run: (n, c, _cb, d) => executeDelayNode(n, c, d),
} as const
