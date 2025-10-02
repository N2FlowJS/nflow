import { NodePlugin } from '../@node-plugin/type';
import { executeWebOpenNode } from './execute';

export const WebOpenPlugin: NodePlugin = {
  name: 'web-open',
  match: (n) => n?.data?.type === 'web-open',
  run: (n, c, cb, d) => executeWebOpenNode(n, c, cb, d),
} as const;
