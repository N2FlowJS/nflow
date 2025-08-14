import { NodePlugin } from '../@node-plugin/type';
import { isGenerateNodeData } from '../../utils/client/isNode';
import { executeGenerateNode } from '../executeGenerateNode';

export const generatePlugin: NodePlugin = {
  name: 'generate',
  match: (n) => isGenerateNodeData(n.data),
  run: (n, c, cb, d) => executeGenerateNode(n, c, cb, d),
} as const;
