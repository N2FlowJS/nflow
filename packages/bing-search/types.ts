import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface BingSearchForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  maxResults?: number;
  safeSearch?: 'off' | 'moderate' | 'strict';
  language?: string;
  country?: string;
  apiKey?: string;
  useSystemConfig?: boolean;
  searchType?: 'web' | 'images' | 'news' | 'videos';
}

export type BingSearchNodeData = BaseNodeData<BingSearchForm> & { type: 'bingsearch' };
