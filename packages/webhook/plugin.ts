import { NodePlugin } from '../@node-plugin/type';
import { executeWebhookNode } from './executeWebhookNode';

export const plugin: NodePlugin = {
  name: 'webhook',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'webhook';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeWebhookNode(n, c, d),
} as const;
