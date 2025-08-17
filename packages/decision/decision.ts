import { NodePlugin } from '../@node-plugin/type';
import { executeDecisionNode } from './execute';

export const decisionPlugin: NodePlugin = {
  name: 'decision',
  match: (n) => n?.data?.type === 'decision',
  run: (n, c, _cb, d) => executeDecisionNode(n, c, d),
} as const;
