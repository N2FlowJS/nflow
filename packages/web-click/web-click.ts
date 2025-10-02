import { NodePlugin } from '../@node-plugin/type';
import { executeWebClickNode } from './execute';

export const WebClickPlugin: NodePlugin = {
  name: 'web-click',
  match: (n) => n?.data?.type === 'web-click',
  run: (n, c, cb, d) => executeWebClickNode(n, c, cb, d),
} as const;
