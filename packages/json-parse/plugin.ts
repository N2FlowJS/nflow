import { NodePlugin } from '../@node-plugin/type'
import { executeJsonParseNode } from './execute'

export const plugin: NodePlugin = {
  name: 'json-parse',
  match: (n) => n?.data?.type === 'json-parse',
  run: (n, c, _cb, d) => executeJsonParseNode(n, c, d),
} as const
