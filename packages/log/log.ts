import { NodePlugin } from '../@node-plugin/type'
import { executeLogNode } from './execute'

export const logPlugin: NodePlugin = {
  name: 'log',
  match: (n) => n?.data?.type === 'log',
  run: (n, c, _cb, d) => executeLogNode(n, c, d),
} as const
