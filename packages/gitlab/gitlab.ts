import { NodePlugin } from '../@node-plugin/type'
import { executeGitLabNode } from '../../utils/server/nodeExecution/node/executeGitLabNode'

export const gitlabPlugin: NodePlugin = {
  name: 'gitlab',
  match: (n) => n?.data?.type === 'gitlab',
  run: (n, c, _cb, d) => executeGitLabNode(n, c, d),
} as const
