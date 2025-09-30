import { NodePlugin } from '../@node-plugin/type'
import { executePdfAnalysisNode } from './execute'

export const plugin: NodePlugin = {
  name: 'pdfanalysis',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'pdfanalysis';
    }
    return false;
  },
  run: (n, c, _cb, d) => executePdfAnalysisNode(n, c, d),
} as const
