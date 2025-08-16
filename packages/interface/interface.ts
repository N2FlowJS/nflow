import { NodePlugin } from '../@node-plugin/type';
import { isInterfaceNodeData } from '../../utils/client/isNode'; // TODO path fix or re-export
import { executeInterfaceNode } from './executeInterfaceNode';

export const interfacePlugin: NodePlugin = {
  name: 'interface',
  match: (n) => isInterfaceNodeData(n.data),
  run: (n, c, _cb, d) => executeInterfaceNode(n, c, d),
} as const;
