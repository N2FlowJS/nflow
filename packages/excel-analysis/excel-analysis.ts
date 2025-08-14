import { NodePlugin } from '../@node-plugin/type'
import { executeExcelAnalysisNode } from '../../utils/server/nodeExecution/node/executeExcelAnalysisNode'

export const excelAnalysisPlugin: NodePlugin = {
  name: 'excelanalysis',
  match: (n) => n?.data?.type === 'excelanalysis',
  run: (n, c, _cb, d) => executeExcelAnalysisNode(n, c, d),
} as const
