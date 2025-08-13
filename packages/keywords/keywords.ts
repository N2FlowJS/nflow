import { NodePlugin } from '../@node-plugin/type';
import { isKeywordsNodeData } from '../../utils/client/isNode';
import { executeKeywordsNode } from '../../utils/server/nodeExecution/node/executeKeywordsNode';

export const keywordsPlugin: NodePlugin = {
  name: 'keywords',
  match: (n) => isKeywordsNodeData(n.data),
  run: (n, c, cb, d) => executeKeywordsNode(n, c, cb, d),
} as const;
