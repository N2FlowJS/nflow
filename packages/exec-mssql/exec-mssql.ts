import { isExecMssqlNodeData } from '../../utils/client/isNode';
import { executeExecMssqlNode } from '../../utils/server/nodeExecution/node/executeExecMssqlNode';
import { NodePlugin } from '../@node-plugin/type';

export const execMssqlPlugin: NodePlugin = {
  name: 'exec-mssql',
  match: (n) => isExecMssqlNodeData(n.data),
  run: (n, c, _cb, d) => executeExecMssqlNode(n, c, d),
} as const;

