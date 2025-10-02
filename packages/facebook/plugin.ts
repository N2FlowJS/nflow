import { FlowNode } from '@n2flowjs/flow';
import { NodePlugin } from '../@node-plugin/type'
import { executeFacebookNode } from './execute'

export const plugin: NodePlugin = {
  name: 'facebook',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'facebook';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeFacebookNode(n, c, d),
} as const
