import { NodePlugin } from '../@node-plugin/type'
import { executeTikTokNode } from '../../utils/server/nodeExecution/node/executeTikTokNode'

export const tiktokPlugin: NodePlugin = {
  name: 'tiktok',
  match: (n) => n?.data?.type === 'tiktok',
  run: (n, c, _cb, d) => executeTikTokNode(n, c, d),
} as const
