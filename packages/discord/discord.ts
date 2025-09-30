import { FlowNode } from 'models/nodeDataMap';
import { NodePlugin } from '../@node-plugin/type'
import { executeDiscordNode } from './executeDiscordNode'

export const discordPlugin: NodePlugin = {
  name: 'discord',
  match: (n) => {
    if (typeof n === 'object' && n !== null && 'data' in n) {
      const data = (n as { data?: { type?: string } }).data;
      return data?.type === 'discord';
    }
    return false;
  },
  run: (n: FlowNode, c, _cb, d) => executeDiscordNode(n, c, d),
} as const
