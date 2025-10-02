import { FlowNode } from '@n2flowjs/flow';
import { NodePlugin } from '../@node-plugin/type'
import { executeFileAnalysisNode } from './execute'

export const plugin: NodePlugin = {
  name: 'fileanalysis',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'fileanalysis';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeFileAnalysisNode(n, c, d),
} as const
