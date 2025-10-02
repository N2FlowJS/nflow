import { executeExecMysqlNode } from './executeExecMysqlNode';
import { NodePlugin } from '../@node-plugin/type';
import { FlowNode } from '@n2flowjs/flow';

export const execMysqlPlugin: NodePlugin = {
  name: 'exec-mysql',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'type' in n) {
      return (n as { type?: string }).type === 'exec-mysql';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeExecMysqlNode(n, c, d),
} as const;
