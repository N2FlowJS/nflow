
import { FlowNode } from 'models/nodeDataMap';
import { NodePlugin } from '../@node-plugin/type';


import { executeHistoryMessageNode } from './execute';
import { FlowExecutionContext } from '@n2flowjs/flow';

export const plugin: NodePlugin = {
  name: 'history-message',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return !!(data && data.type === 'history-message');
    }
    return false;
  },
  run:  (n: FlowNode, c: FlowExecutionContext, _cb, d) => executeHistoryMessageNode(n, c, d),
} as const;
