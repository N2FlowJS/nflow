import { NodePlugin } from '../@node-plugin/type'
import { executeDuckGoSearchNode } from '../../utils/server/nodeExecution/node/executeDuckGoSearchNode'

export const duckGoSearchPlugin: NodePlugin = {
  name: 'duckgosearch',
  match: (n) => n?.data?.type === 'duckgosearch',
  run: (n, c, _cb, d) => executeDuckGoSearchNode(n, c, d),
} as const
