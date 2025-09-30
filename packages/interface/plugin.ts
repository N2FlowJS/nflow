import { NodePlugin } from '../@node-plugin/type';
import { executeInterfaceNode } from './executeInterfaceNode';

export const interfacePlugin: NodePlugin = {
  name: 'interface',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'interface';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeInterfaceNode(n, c, d),
} as const;
