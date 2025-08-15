import { NodePlugin } from '../@node-plugin/type';
import { executeKeywordsNode } from './execute';

export const keywordsPlugin: NodePlugin = {
  name: 'keywords',
  match: (n) => n?.data?.type === 'keywords',
  run: (n, c, cb, d) => executeKeywordsNode(n, c, cb, d),
} as const;
