import { NodePlugin } from '../@node-plugin/type'
import { executeWeChatNode } from './executeWeChatNode'

export const wechatPlugin: NodePlugin = {
  name: 'wechat',
  match: (n) => n?.data?.type === 'wechat',
  run: (n, c, _cb, d) => executeWeChatNode(n, c, d),
} as const
