import { FlowNode } from 'models/nodeDataMap';
import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

export const confluencePlugin: NodePlugin = {
  name: 'confluence',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'confluence';
    }
    return false;
  },
  run: (n, c, _cb, d) => execute(n as FlowNode, c, d),
} as const
