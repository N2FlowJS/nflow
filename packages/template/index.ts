import { execute } from './execute';
import { NodePlugin } from '../@node-plugin/type';

export const templatePlugin: NodePlugin = {
  name: 'template',
  match: (n) => n?.data?.type === 'template',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const;

export { templatePlugin as plugin };
export default templatePlugin;
