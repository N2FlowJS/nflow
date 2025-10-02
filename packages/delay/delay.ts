import { FlowNode } from '@n2flowjs/flow';
import { NodePlugin } from '../@node-plugin/type'
import { executeDelayNode } from './executeDelayNode'

export const delayPlugin: NodePlugin = {
  name: 'delay',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'delay';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeDelayNode(n as FlowNode, c, d),
} as const
