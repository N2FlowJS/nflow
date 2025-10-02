import { NodePlugin } from '../@node-plugin/type'
import { executeDuckGoSearchNode } from './executeDuckGoSearchNode'
import { FlowNode } from '@n2flowjs/flow';

export const duckGoSearchPlugin: NodePlugin = {
  name: 'duckgosearch',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'duckgosearch';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeDuckGoSearchNode(n, c, d),
} as const
