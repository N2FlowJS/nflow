import { executeExecPostgresNode } from './execute';
import { NodePlugin } from '../@node-plugin/type';


export const execPostgresPlugin: NodePlugin = {
  name: 'exec-postgres',
  match: (n) => n.data.type === 'exec-postgres',
  run: (n, c, _cb, d) => executeExecPostgresNode(n, c, d),
} as const;
