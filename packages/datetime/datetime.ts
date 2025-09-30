import { FlowNode } from 'models/nodeDataMap';
import { NodePlugin } from '../@node-plugin/type'
import { executeDateTimeNode } from './execute'

export const datetimePlugin: NodePlugin = {
  name: 'datetime',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'datetime';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeDateTimeNode(n as FlowNode, c, d),
} as const
