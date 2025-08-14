import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

export const confluencePlugin: NodePlugin = {
  name: 'confluence',
  match: (n) => n?.data?.type === 'confluence',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const
