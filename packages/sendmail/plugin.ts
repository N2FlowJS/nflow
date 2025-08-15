import { NodePlugin } from '../@node-plugin/type'
import { executeSendMailNode } from './execute'

export const plugin: NodePlugin = {
  name: 'sendmail',
  match: (n) => n?.data?.type === 'sendmail',
  run: (n, c, _cb, d) => executeSendMailNode(n, c, d),
} as const
