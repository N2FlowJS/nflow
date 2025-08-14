import { NodePlugin } from '../@node-plugin/type'
import { executeSendMailNode } from '../../utils/server/nodeExecution/node/executeSendMailNode'

export const sendMailPlugin: NodePlugin = {
  name: 'sendmail',
  match: (n) => n?.data?.type === 'sendmail',
  run: (n, c, _cb, d) => executeSendMailNode(n, c, d),
} as const
