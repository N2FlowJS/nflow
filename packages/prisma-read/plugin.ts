import { FlowNode } from 'models/nodeDataMap';
import { NodePlugin } from '../@node-plugin/type';
import { executePrismaReadNode } from './execute';

export const plugin: NodePlugin = {
  name: 'prisma-read',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return !!(data && data.type === 'prisma-read');
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executePrismaReadNode(n, c, d),
} as const;
