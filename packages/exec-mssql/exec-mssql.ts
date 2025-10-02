import { executeExecMssqlNode } from './execute';
import { NodePlugin } from '../@node-plugin/type';
import { FlowNode } from '@n2flowjs/flow';

export const execMssqlPlugin: NodePlugin = {
  name: 'execmssql',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'execmssql';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeExecMssqlNode(n, c, d),
} as const;

