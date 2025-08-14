import { NodePlugin } from '../@node-plugin/type'
import { executeImageAnalysisNode } from '../executeImageAnalysisNode'

export const imageAnalysisPlugin: NodePlugin = {
  name: 'imageanalysis',
  match: (n) => n?.data?.type === 'imageanalysis',
  run: (n, c, _cb, d) => executeImageAnalysisNode(n, c, d),
} as const
