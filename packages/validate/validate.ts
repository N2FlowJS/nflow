import { NodePlugin } from '../@node-plugin'
import { executeValidateNode } from './execute'

export const validatePlugin: NodePlugin = {
  name: 'validate',
  match: (n) => n?.data?.type === 'validate',
  run: (n, c, _cb, d) => executeValidateNode(n, c, d),
} as const
