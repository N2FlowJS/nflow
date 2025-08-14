import { NodePlugin } from '../@node-plugin/type'
import { executeTikTokNode } from './executeTikTokNode'

export const tiktokPlugin: NodePlugin = {
  name: 'tiktok',
  match: (n) => n?.data?.type === 'tiktok',
  run: (n, c, _cb, d) => executeTikTokNode(n, c, d),
} as const
