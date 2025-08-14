import { executeExecMysqlNode } from './executeExecMysqlNode';
import { NodePlugin } from '../@node-plugin/type';

export const execMysqlPlugin: NodePlugin = {
  name: 'exec-mysql',
  match: (n) => n.type === 'exec-mysql',
  run: (n, c, _cb, d) => executeExecMysqlNode(n, c, d),
} as const;
