import { NodePlugin } from '../@node-plugin/type';
import { isRetrievalNodeData } from '../../utils/client/isNode';
import { executeRetrievalNode } from '../../utils/server/nodeExecution/node/executeRetrievalNode';

export const retrievalPlugin: NodePlugin = {
  name: 'retrieval',
  match: (n) => isRetrievalNodeData(n.data),
  run: (n, c, _cb, d) => executeRetrievalNode(n, c, d),
} as const;
