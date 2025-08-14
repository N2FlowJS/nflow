import { NodePlugin } from '../@node-plugin/type'
import { executeLogAnalysisNode } from '../../utils/server/nodeExecution/node/executeLogAnalysisNode'

export const logAnalysisPlugin: NodePlugin = {
  name: 'loganalysis',
  match: (n) => n?.data?.type === 'loganalysis',
  run: (n, c, _cb, d) => executeLogAnalysisNode(n, c, d),
} as const
