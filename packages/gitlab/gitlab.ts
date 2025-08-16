import { NodePlugin } from '../@node-plugin/type'
import { executeGitLabNode } from './executeGitLabNode';

export const gitlabPlugin: NodePlugin = {
  name: 'gitlab',
  match: (n) => n?.data?.type === 'gitlab',
  run: (n, c, _cb, d) => executeGitLabNode(n, c, d),
} as const
