import { NodePlugin } from '../@node-plugin/type'
// Updated path to existing implementation (execute.ts)
import { executeGoogleSearchNode } from './execute';

export const googleSearchPlugin: NodePlugin = {
  name: 'googlesearch',
  match: (n) => n?.data?.type === 'googlesearch',
  run: (n, c, _cb, d) => executeGoogleSearchNode(n, c, d),
} as const
