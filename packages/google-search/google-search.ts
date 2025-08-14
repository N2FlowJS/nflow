import { NodePlugin } from '../@node-plugin/type'
import { executeGoogleSearchNode } from '../../utils/server/nodeExecution/node/executeGoogleSearchNode'

export const googleSearchPlugin: NodePlugin = {
  name: 'googlesearch',
  match: (n) => n?.data?.type === 'googlesearch',
  run: (n, c, _cb, d) => executeGoogleSearchNode(n, c, d),
} as const
