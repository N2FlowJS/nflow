import { NodePlugin } from '../@node-plugin/type'
import { executeConfluenceNode } from '../../utils/server/nodeExecution/node/executeConfluenceNode'

export const confluencePlugin: NodePlugin = {
  name: 'confluence',
  match: (n) => n?.data?.type === 'confluence',
  run: (n, c, _cb, d) => executeConfluenceNode(n, c, d),
} as const
