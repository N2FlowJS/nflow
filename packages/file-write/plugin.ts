import { FlowNode } from '@n2flowjs/flow';
import { NodePlugin } from '../@node-plugin/type'
import { executeFileWriteNode } from './execute'

export const plugin: NodePlugin = {
  name: 'file-write',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'file-write';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeFileWriteNode(n, c, d),
} as const
