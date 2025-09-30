import { FlowNode } from 'models/nodeDataMap';
import { NodePlugin } from '../@node-plugin/type'
import { executeExcelAnalysisNode } from './execute'

export const plugin: NodePlugin = {
  name: 'excelanalysis',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'excelanalysis';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeExcelAnalysisNode(n, c, d),
} as const
