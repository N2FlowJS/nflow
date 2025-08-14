import { NodePlugin } from '../@node-plugin/type'
import { executeTelegramNode } from '../../utils/server/nodeExecution/node/executeTelegramNode'

export const telegramPlugin: NodePlugin = {
  name: 'telegram',
  match: (n) => n?.data?.type === 'telegram',
  run: (n, c, _cb, d) => executeTelegramNode(n, c, d),
} as const
