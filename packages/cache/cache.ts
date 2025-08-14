import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

export const cachePlugin: NodePlugin = {
  name: 'cache',
  match: (n) => n?.data?.type === 'cache',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const
