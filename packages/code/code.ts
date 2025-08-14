import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

export const codePlugin: NodePlugin = {
  name: 'code',
  match: (n) => n?.data?.type === 'code',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const
