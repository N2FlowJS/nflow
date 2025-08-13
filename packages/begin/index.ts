import { execute } from './execute';
import { NodePlugin } from '../@node-plugin/type';

export const beginPlugin: NodePlugin = {
  name: 'begin',
  match: (n) => n?.data?.type === 'begin',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const;
