import { NodePlugin } from '../@node-plugin/type'
import { executeLogAnalysisNode } from './execute'

export const plugin: NodePlugin = {
  name: 'loganalysis',
  match: (n) => n?.data?.type === 'loganalysis',
  run: (n, c, _cb, d) => executeLogAnalysisNode(n, c, d),
} as const
