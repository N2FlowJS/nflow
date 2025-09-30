import { NodePlugin } from '../@node-plugin/type'
import { executeTextProcessNode } from './execute'

export const plugin: NodePlugin = {
  name: 'textprocess',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'textprocess';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeTextProcessNode(n, c, d),
} as const
