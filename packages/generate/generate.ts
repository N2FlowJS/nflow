import { NodePlugin } from '../@node-plugin/type';
import { executeGenerateNode } from './executeGenerateNode';

export const generatePlugin: NodePlugin = {
  name: 'generate',
  match: (n) => n.data?.type === 'generate',
  run: (n, c, cb, d) => executeGenerateNode(n, c, cb, d),
} as const;
