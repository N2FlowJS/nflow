import { NodePlugin } from '../@node-plugin/type';
import { executeInterfaceNode } from './executeInterfaceNode';

export const interfacePlugin: NodePlugin = {
  name: 'interface',
  match: (n) => n.data?.type === 'interface',
  run: (n, c, _cb, d) => executeInterfaceNode(n, c, d),
} as const;
