import { NodePlugin } from '../@node-plugin/type'
import { executeWeatherNode } from '../../utils/server/nodeExecution/node/executeWeatherNode'

export const weatherPlugin: NodePlugin = {
  name: 'weather',
  match: (n) => n.data?.type === 'weather',
  run: (n, c, _cb, d) => executeWeatherNode(n, c, d),
} as const
