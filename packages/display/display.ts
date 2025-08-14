import { NodePlugin } from '../@node-plugin/type'
import { executeDisplayNode } from './execute'

export const displayPlugin: NodePlugin = {
  name: 'display',
  match: (n) => n?.data?.type === 'display',
  run: (n, c, _cb, d) => executeDisplayNode(n, c, d),
} as const
