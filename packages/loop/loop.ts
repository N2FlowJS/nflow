import { NodePlugin } from '../@node-plugin/type'
import { executeLoopNode } from './execute'

export const loopPlugin: NodePlugin = {
  name: 'loop',
  match: (n) => n?.data?.type === 'loop',
  run: (n, c, _cb, d) => executeLoopNode(n, c, d),
} as const
