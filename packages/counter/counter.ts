import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

export const counterPlugin: NodePlugin = {
  name: 'counter',
  match: (n) => n?.data?.type === 'counter',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const
