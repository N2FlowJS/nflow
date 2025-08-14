import { NodePlugin } from '../@node-plugin/type'
import { executeFileReadNode } from '../executeFileReadNode'

export const fileReadPlugin: NodePlugin = {
  name: 'file-read',
  match: (n) => n?.data?.type === 'file-read',
  run: (n, c, _cb, d) => executeFileReadNode(n, c, d),
} as const
