import { NodePlugin } from '../@node-plugin/type';
import { isRetrievalNodeData } from '../../utils/client/isNode'; // TODO path fix or re-export
import { executeRetrievalNode } from './execute';

export const retrievalPlugin: NodePlugin = {
  name: 'retrieval',
  match: (n) => isRetrievalNodeData(n.data),
  run: (n, c, _cb, d) => executeRetrievalNode(n, c, d),
} as const;
