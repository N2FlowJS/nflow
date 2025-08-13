import { NodePlugin } from '../@node-plugin/type';
import { isGenerateNodeData } from '../../utils/client/isNode';
import { executeGenerateNode } from '../../utils/server/nodeExecution/node/executeGenerateNode';

export const generatePlugin: NodePlugin = {
  name: 'generate',
  match: (n) => isGenerateNodeData(n.data),
  run: (n, c, cb, d) => executeGenerateNode(n, c, cb, d),
} as const;
