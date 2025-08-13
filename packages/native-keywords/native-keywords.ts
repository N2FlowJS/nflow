import { executeNativeKeywordsNode } from './executeNativeKeywordsNode';
import { NodePlugin } from '../@node-plugin/type';

export const nativeKeywordsPlugin: NodePlugin = {
  name: 'nativekeywords',
  match: (n) => n.data?.type === 'nativekeywords',
  run: (n, c, _cb, d) => executeNativeKeywordsNode(n, c, d),
} as const;
