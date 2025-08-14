import { NodePlugin } from '../@node-plugin/type'
import { executeGoogleMapNode } from '../../utils/server/nodeExecution/node/executeGoogleMapNode'

export const googleMapPlugin: NodePlugin = {
  name: 'googlemap',
  match: (n) => n?.data?.type === 'googlemap',
  run: (n, c, _cb, d) => executeGoogleMapNode(n, c, d),
} as const
