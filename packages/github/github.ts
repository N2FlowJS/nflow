import { NodePlugin } from '../@node-plugin/type'
import { executeGitHubNode } from '../../utils/server/nodeExecution/node/executeGitHubNode'

export const githubPlugin: NodePlugin = {
  name: 'github',
  match: (n) => n?.data?.type === 'github',
  run: (n, c, _cb, d) => executeGitHubNode(n, c, d),
} as const
