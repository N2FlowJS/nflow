import { NodePlugin } from '../@node-plugin/type'
import { executeTransformNode } from '../../utils/server/nodeExecution/node/executeTransformNode'

export const transformPlugin: NodePlugin = {
  name: 'transform',
  match: (n) => n?.data?.type === 'transform',
  run: (n, c, _cb, d) => executeTransformNode(n, c, d),
} as const
