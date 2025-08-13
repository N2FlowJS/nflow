import { isExecPostgresNodeData } from '../../utils/client/isNode';
import { executeExecPostgresNode } from '../../utils/server/nodeExecution/node/executeExecPostgresNode';
import { NodePlugin } from '../@node-plugin/type';


export const execPostgresPlugin: NodePlugin = {
  name: 'exec-postgres',
  match: (n) => isExecPostgresNodeData(n.data),
  run: (n, c, _cb, d) => executeExecPostgresNode(n, c, d),
} as const;
