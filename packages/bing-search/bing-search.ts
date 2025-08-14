import { NodePlugin } from '../@node-plugin/type';
import { execute } from './execute';

export const bingSearchPlugin: NodePlugin = {
  name: 'bingsearch',
  match: (n) => n?.data?.type === 'bingsearch',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const;
