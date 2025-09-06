import { execute } from './execute';
import { NodePlugin } from '../@node-plugin/type';

export const categorizePlugin: NodePlugin = {
  name: 'categorize',
  match: (n) => n?.data?.type === 'categorize',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const;
