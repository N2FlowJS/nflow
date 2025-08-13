import { isExecMysqlNodeData } from '../../utils/client/isNode';
import { executeExecMysqlNode } from '../../utils/server/nodeExecution/node/executeExecMysqlNode';
import { NodePlugin } from '../@node-plugin/type';

export const execMysqlPlugin: NodePlugin = {
  name: 'exec-mysql',
  match: (n) => isExecMysqlNodeData(n.data),
  run: (n, c, _cb, d) => executeExecMysqlNode(n, c, d),
} as const;
