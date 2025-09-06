import { executeExecPostgresNode } from './execute';
import { NodePlugin } from '../@node-plugin/type';


export const execPostgresPlugin: NodePlugin = {
  name: 'execpostgres',
  match: (n) => n.data.type === 'execpostgres',
  run: (n, c, _cb, d) => executeExecPostgresNode(n, c, d),
} as const;
