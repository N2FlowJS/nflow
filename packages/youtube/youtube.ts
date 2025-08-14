import { NodePlugin } from '../@node-plugin/type';
import { execute } from './execute';

export const youtubePlugin: NodePlugin = {
  name: 'youtube',
  match: (n) => n?.data?.type === 'youtube',
  run: (n, c, _cb, d) => execute(n, c, d),
} as const;
