import { FlowNode } from 'models/nodeDataMap';
import { NodePlugin } from '../@node-plugin/type'
import { executeCsvAnalysisNode } from './execute'

export const plugin: NodePlugin = {
  name: 'csvanalysis',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'csvanalysis';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeCsvAnalysisNode(n as FlowNode, c, d),
} as const
