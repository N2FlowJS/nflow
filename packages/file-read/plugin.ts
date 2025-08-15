import { NodePlugin } from '../@node-plugin/type'
import { executeFileReadNode } from './execute'

export const plugin: NodePlugin = {
  name: 'file-read',
  match: (n) => n?.data?.type === 'file-read',
  run: (n, c, _cb, d) => executeFileReadNode(n, c, d),
} as const
