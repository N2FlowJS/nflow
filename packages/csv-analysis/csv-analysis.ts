import { NodePlugin } from '../@node-plugin/type'
import { executeCsvAnalysisNode } from '../../utils/server/nodeExecution/node/executeCsvAnalysisNode'

export const csvAnalysisPlugin: NodePlugin = {
  name: 'csvanalysis',
  match: (n) => n?.data?.type === 'csvanalysis',
  run: (n, c, _cb, d) => executeCsvAnalysisNode(n, c, d),
} as const
