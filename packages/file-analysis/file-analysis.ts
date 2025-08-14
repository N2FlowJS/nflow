import { NodePlugin } from '../@node-plugin/type'
import { executeFileAnalysisNode } from './execute'

export const fileAnalysisPlugin: NodePlugin = {
  name: 'fileanalysis',
  match: (n) => n?.data?.type === 'fileanalysis',
  run: (n, c, _cb, d) => executeFileAnalysisNode(n, c, d),
} as const
