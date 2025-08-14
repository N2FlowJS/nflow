import { NodePlugin } from '../@node-plugin/type'
import { executeDateTimeNode } from './execute'

export const datetimePlugin: NodePlugin = {
  name: 'datetime',
  match: (n) => n?.data?.type === 'datetime',
  run: (n, c, _cb, d) => executeDateTimeNode(n, c, d),
} as const
