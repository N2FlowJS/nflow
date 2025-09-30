import { NodePlugin } from '../@node-plugin/type'
import { executeLogAnalysisNode } from './execute'

export const plugin: NodePlugin = {
  name: 'loganalysis',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'loganalysis';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeLogAnalysisNode(n, c, d),
} as const
