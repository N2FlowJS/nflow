import { NodePlugin } from '../@node-plugin/type';
import { isDecisionNodeData } from '../../utils/client/isNode'; // TODO path fix or re-export
import { executeDecisionNode } from './execute';

export const decisionPlugin: NodePlugin = {
  name: 'decision',
  match: (n) => isDecisionNodeData(n.data),
  run: (n, c, _cb, d) => executeDecisionNode(n, c, d),
} as const;
