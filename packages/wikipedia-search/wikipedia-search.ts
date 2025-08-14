import { NodePlugin } from '../@node-plugin/type'
import { executeWikipediaSearchNode } from './executeWikipediaSearchNode'

export const wikipediaSearchPlugin: NodePlugin = {
  name: 'wikipediasearch',
  match: (n) => n?.data?.type === 'wikipediasearch',
  run: (n, c, _cb, d) => executeWikipediaSearchNode(n, c, d),
} as const
