import { NodePlugin } from '../@node-plugin/type'
import { executeSlackNode } from './executeSlackNode'

export const slackPlugin: NodePlugin = {
  name: 'slack',
  match: (n) => n?.data?.type === 'slack',
  run: (n, c, _cb, d) => executeSlackNode(n, c, d),
} as const
