import { FlowNode } from 'models/nodeDataMap';
import { NodePlugin } from '../@node-plugin/type'
import { executeFileReadNode } from './execute'

export const plugin: NodePlugin = {
  name: 'file-read',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return !!(data && data.type === 'file-read');
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeFileReadNode(n, c, d),
} as const
