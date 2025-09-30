import { executeExecPostgresNode } from './execute';
import { NodePlugin } from '../@node-plugin/type';


export const execPostgresPlugin: NodePlugin = {
  name: 'exec-postgres',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'exec-postgres';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeExecPostgresNode(n as import('../../models/flowTypes').FlowNode, c, d),
} as const;
