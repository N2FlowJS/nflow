import { NodePlugin } from '../@node-plugin/type'
import { executePdfAnalysisNode } from './execute'

export const pdfAnalysisPlugin: NodePlugin = {
  name: 'pdfanalysis',
  match: (n) => n?.data?.type === 'pdfanalysis',
  run: (n, c, _cb, d) => executePdfAnalysisNode(n, c, d),
} as const
