import { NodePlugin } from '../@node-plugin/type'
import { executeWhatsAppNode } from '../../utils/server/nodeExecution/node/executeWhatsAppNode'

export const whatsappPlugin: NodePlugin = {
  name: 'whatsapp',
  match: (n) => n?.data?.type === 'whatsapp',
  run: (n, c, _cb, d) => executeWhatsAppNode(n, c, d),
} as const
