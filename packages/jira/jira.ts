import { NodePlugin } from '../@node-plugin/type'
import { executeJiraNode } from '../../utils/server/nodeExecution/node/executeJiraNode'

export const jiraPlugin: NodePlugin = {
  name: 'jira',
  match: (n) => n?.data?.type === 'jira',
  run: (n, c, _cb, d) => executeJiraNode(n, c, d),
} as const
