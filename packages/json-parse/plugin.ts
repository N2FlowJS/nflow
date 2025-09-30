import { FlowNode } from 'models/nodeDataMap';
import { NodePlugin } from '../@node-plugin/type'
import { executeJsonParseNode } from './execute'

export const plugin: NodePlugin = {
  name: 'json-parse',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'json-parse';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeJsonParseNode(n, c, d),
} as const
