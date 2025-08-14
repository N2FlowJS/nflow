import { NodePlugin } from '../@node-plugin/type'
import { executeRewriteNode } from './executeRewriteNode'

export const rewritePlugin: NodePlugin = {
  name: 'rewrite',
  match: (n) => n?.data?.type === 'rewrite',
  run: (n, c, cb, d) => executeRewriteNode(n, c, cb, d),
} as const
