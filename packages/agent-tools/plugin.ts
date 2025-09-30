import { NodePlugin } from '../@node-plugin/type'
import { execute } from './execute'

// Normalized to 'agent-tools' (with hyphen) to align with FlowNode type definitions
export const plugin: NodePlugin = {
  name: 'agent-tools',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'agent-tools';
    }
    return false;
  },
  run: (n, c, _cb, d) => execute(n as any, c, d),
} as const
