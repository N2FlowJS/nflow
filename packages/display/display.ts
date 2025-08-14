import { NodePlugin } from '../@node-plugin/type'
import { executeDisplayNode } from '../../utils/server/nodeExecution/node/executeDisplayNode'

export const displayPlugin: NodePlugin = {
  name: 'display',
  match: (n) => n?.data?.type === 'display',
  run: (n, c, _cb, d) => executeDisplayNode(n, c, d),
} as const
