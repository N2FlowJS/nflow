import { NodePlugin } from '../@node-plugin/type'
import { executeTextProcessNode } from './execute'

export const plugin: NodePlugin = {
  name: 'textprocess',
  match: (n) => n?.data?.type === 'textprocess',
  run: (n, c, _cb, d) => executeTextProcessNode(n, c, d),
} as const
