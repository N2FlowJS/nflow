import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

export const conditionPlugin: NodePlugin = {
  name: 'condition',
  match: (n) => n?.data?.type === 'condition',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const
