import { NodePlugin } from '../@node-plugin/type'
import { executeFileWriteNode } from './execute'

export const plugin: NodePlugin = {
  name: 'file-write',
  match: (n) => n?.data?.type === 'file-write',
  run: (n, c, _cb, d) => executeFileWriteNode(n, c, d),
} as const
