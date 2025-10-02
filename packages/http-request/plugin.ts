import { FlowNode } from '@n2flowjs/flow';
import { NodePlugin } from '../@node-plugin/type'
import { executeHttpRequestNode } from './execute'

export const plugin: NodePlugin = {
  name: 'http-request',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'http-request';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeHttpRequestNode(n, c, d),
} as const
