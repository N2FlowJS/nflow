import { NodePlugin } from '../@node-plugin/type';
import { executeWebTypingNode } from './execute';

export const WebTypingPlugin: NodePlugin = {
  name: 'web-typing',
  match: (n) => n?.data?.type === 'web-typing',
  run: (n, c, cb, d) => executeWebTypingNode(n, c, cb, d),
} as const;
