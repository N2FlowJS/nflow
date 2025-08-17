import { NodePlugin } from '../@node-plugin/type';
import { executeWebhookNode } from './executeWebhookNode';

export const plugin: NodePlugin = {
  name: 'webhook',
  match: (n) => n?.data?.type === 'webhook',
  run: (n, c, _cb, d) => executeWebhookNode(n, c, d),
} as const;
