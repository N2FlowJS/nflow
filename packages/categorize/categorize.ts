import { isCategorizeNodeData } from '../../utils/client/isNode';
import { executeCategorizeNode } from '../../utils/server/nodeExecution/node/executeCategorizeNode';
import { NodePlugin } from '../@node-plugin/type';

export const categorizePlugin: NodePlugin = {
  name: 'categorize',
  match: (n) => isCategorizeNodeData(n.data),
  run: (n, c, _cb, d) => executeCategorizeNode(n, c, d),
} as const;
