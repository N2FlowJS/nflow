import { NodePlugin } from '../@node-plugin/type'
import { executeTwitterNode } from './executeTwitterNode'

export const twitterPlugin: NodePlugin = {
  name: 'twitter',
  match: (n) => n?.data?.type === 'twitter',
  run: (n, c, _cb, d) => executeTwitterNode(n, c, d),
} as const
