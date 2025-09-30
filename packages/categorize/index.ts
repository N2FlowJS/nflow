import { execute } from './execute';
import { NodePlugin } from '../@node-plugin/type';
import { FlowNode } from 'models/nodeDataMap';

export const categorizePlugin: NodePlugin = {
  name: 'categorize',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'categorize';
    }
    return false;
  },
  run: (n, c, _cb, d) => execute(n as FlowNode, c, d),
} as const;
