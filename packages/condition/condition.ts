import { FlowNode } from '@n2flowjs/flow';
import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

export const conditionPlugin: NodePlugin = {
  name: 'condition',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'condition';
    }
    return false;
  },
  run: (n, c, _cb, d) => execute(n as FlowNode, c, d),
} as const
