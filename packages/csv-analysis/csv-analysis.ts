import { NodePlugin } from '../@node-plugin/type'
import { executeCsvAnalysisNode } from './execute'

export const csvAnalysisPlugin: NodePlugin = {
  name: 'csvanalysis',
  match: (n) => n?.data?.type === 'csvanalysis',
  run: (n, c, _cb, d) => executeCsvAnalysisNode(n, c, d),
} as const
