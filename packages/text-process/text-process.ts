import { NodePlugin } from '../@node-plugin/type'
import { executeTextProcessNode } from './execute'

export const textProcessPlugin: NodePlugin = {
  name: 'text-process',
  match: (n) => n?.data?.type === 'text-process',
  run: (n, c, _cb, d) => executeTextProcessNode(n, c, d),
} as const
