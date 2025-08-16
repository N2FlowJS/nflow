import { NodePlugin } from '../@node-plugin/type'
// Updated path to existing implementation (execute.ts)
import { executeJiraNode } from './execute';

export const jiraPlugin: NodePlugin = {
  name: 'jira',
  match: (n) => n?.data?.type === 'jira',
  run: (n, c, _cb, d) => executeJiraNode(n, c, d),
} as const
