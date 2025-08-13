import { NodePlugin } from '../@node-plugin/type'
import { executeFileWriteNode } from '../../utils/server/nodeExecution/node/executeFileWriteNode'

export const fileWritePlugin: NodePlugin = {
  name: 'file-write',
  match: (n) => n?.data?.type === 'file-write',
  run: (n, c, _cb, d) => executeFileWriteNode(n, c, d),
} as const
