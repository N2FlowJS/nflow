import { NodePlugin } from '../@node-plugin/type'
import { executeMathNode } from './executeMathNode'

export const plugin: NodePlugin = {
  name: 'math',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'math';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeMathNode(n, c, d),
} as const
