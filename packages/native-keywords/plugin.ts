import { executeNativeKeywordsNode } from './execute';
import { NodePlugin } from '../@node-plugin/type';

export const nativeKeywordsPlugin: NodePlugin = {
  name: 'nativekeywords',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'nativekeywords';
    }
    return false;
  },
  run: (n, c, _cb, d) => executeNativeKeywordsNode(n, c, d),
} as const;

export default nativeKeywordsPlugin;
