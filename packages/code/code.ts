import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

export const codePlugin: NodePlugin = {
  name: 'code',
  match: (n: any) => n?.data?.type === 'code',
  run: (n: any, c: any, _cb: any, d: any) => execute(n, c, d),
} as const
