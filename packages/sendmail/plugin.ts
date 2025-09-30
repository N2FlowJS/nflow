import { NodePlugin } from '../@node-plugin/type'
import { executeSendMailNode } from './execute'

export const plugin: NodePlugin = {
  name: 'sendmail',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'sendmail';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeSendMailNode(n, c, d),
} as const
