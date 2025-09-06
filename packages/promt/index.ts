import { execute } from './execute';
import { NodePlugin } from '../@node-plugin/type';

export const promtPlugin: NodePlugin = {
  name: 'promt',
  match: (n) => n?.data?.type === 'promt',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const;

export { promtPlugin as plugin };
export default promtPlugin;
