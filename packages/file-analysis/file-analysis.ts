import { NodePlugin } from '../@node-plugin/type'
import { executeFileAnalysisNode } from './execute'

export const fileAnalysisPlugin: NodePlugin = {
  name: 'fileanalysis',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'fileanalysis';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeFileAnalysisNode(n as import('../../models/flowTypes').FlowNode, c, d),
} as const
