import { NodePlugin } from '../@node-plugin/type';
import { execute } from './execute';

export const plugin: NodePlugin = {
  name: 'begin',
  match: (n) => n?.data?.type === 'begin',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const;
