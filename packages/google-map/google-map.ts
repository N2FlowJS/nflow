import { NodePlugin } from '../@node-plugin/type'
// Updated path to existing implementation (execute.ts)
import { executeGoogleMapNode } from './execute';

export const googleMapPlugin: NodePlugin = {
  name: 'googlemap',
  match: (n) => n?.data?.type === 'googlemap',
  run: (n, c, _cb, d) => executeGoogleMapNode(n, c, d),
} as const
