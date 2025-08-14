import { NodePlugin } from '../@node-plugin/type'
import { executeWeatherNode } from './executeWeatherNode'

export const weatherPlugin: NodePlugin = {
  name: 'weather',
  match: (n) => n.data?.type === 'weather',
  run: (n, c, _cb, d) => executeWeatherNode(n, c, d),
} as const
