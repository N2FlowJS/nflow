import { FlowNode } from '@n2flowjs/flow';
import { NodePlugin } from '../@node-plugin/type'
import { executeDisplayNode } from './execute'

export const displayPlugin: NodePlugin = {
  name: 'display',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'display';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeDisplayNode(n, c, d),
} as const
