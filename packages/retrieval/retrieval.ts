import { NodePlugin } from '../@node-plugin/type';
import { executeRetrievalNode } from './execute';

export const retrievalPlugin: NodePlugin = {
  name: 'retrieval',
  match: (n) => n?.data?.type === 'retrieval',
  run: (n, c, _cb, d) => executeRetrievalNode(n, c, d),
} as const;
