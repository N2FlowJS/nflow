import { NodePlugin } from '../@node-plugin/type'
import { executeDiscordNode } from './executeDiscordNode'

export const discordPlugin: NodePlugin = {
  name: 'discord',
  match: (n) => n?.data?.type === 'discord',
  run: (n, c, _cb, d) => executeDiscordNode(n, c, d),
} as const
