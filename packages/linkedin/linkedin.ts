import { NodePlugin } from '../@node-plugin/type'
import { executeLinkedInNode } from '../../utils/server/nodeExecution/node/executeLinkedInNode'

export const linkedinPlugin: NodePlugin = {
  name: 'linkedin',
  match: (n) => n?.data?.type === 'linkedin',
  run: (n, c, _cb, d) => executeLinkedInNode(n, c, d),
} as const
