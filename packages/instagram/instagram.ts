import { NodePlugin } from '../@node-plugin/type'
import { executeInstagramNode } from '../../utils/server/nodeExecution/node/executeInstagramNode'

export const instagramPlugin: NodePlugin = {
  name: 'instagram',
  match: (n) => n?.data?.type === 'instagram',
  run: (n, c, _cb, d) => executeInstagramNode(n, c, d),
} as const
