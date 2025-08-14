import { NodePlugin } from '../@node-plugin/type'
import { executeLoopNode } from '../executeLoopNode'

export const loopPlugin: NodePlugin = {
  name: 'loop',
  match: (n) => n?.data?.type === 'loop',
  run: (n, c, _cb, d) => executeLoopNode(n, c, d),
} as const
