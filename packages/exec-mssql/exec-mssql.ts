import { executeExecMssqlNode } from './execute';
import { NodePlugin } from '../@node-plugin/type';

export const execMssqlPlugin: NodePlugin = {
  name: 'execmssql',
  match: (n) => n?.data?.type === 'execmssql',
  run: (n, c, _cb, d) => executeExecMssqlNode(n, c, d),
} as const;

