import { NodePlugin } from '../@node-plugin/type'
import { executeRewriteNode } from '../../utils/server/nodeExecution/node/executeRewriteNode'

export const rewritePlugin: NodePlugin = {
  name: 'rewrite',
  match: (n) => n?.data?.type === 'rewrite',
  run: (n, c, cb, d) => executeRewriteNode(n, c, cb, d),
} as const
