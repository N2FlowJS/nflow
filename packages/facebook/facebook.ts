import { NodePlugin } from '../@node-plugin/type'
import { executeFacebookNode } from '../../utils/server/nodeExecution/node/executeFacebookNode'

export const facebookPlugin: NodePlugin = {
  name: 'facebook',
  match: (n) => n?.data?.type === 'facebook',
  run: (n, c, _cb, d) => executeFacebookNode(n, c, d),
} as const
