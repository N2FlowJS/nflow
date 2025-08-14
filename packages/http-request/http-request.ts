import { NodePlugin } from '../@node-plugin/type'
import { executeHttpRequestNode } from '../executeHttpRequestNode'

export const httpRequestPlugin: NodePlugin = {
  name: 'http-request',
  match: (n) => n?.data?.type === 'http-request',
  run: (n, c, _cb, d) => executeHttpRequestNode(n, c, d),
} as const
