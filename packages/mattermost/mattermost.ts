import { NodePlugin } from '../@node-plugin/type'
import { executeMattermostNode } from '../../utils/server/nodeExecution/node/executeMattermostNode'

export const mattermostPlugin: NodePlugin = {
  name: 'mattermost',
  match: (n) => n?.data?.type === 'mattermost',
  run: (n, c, _cb, d) => executeMattermostNode(n, c, d),
} as const
