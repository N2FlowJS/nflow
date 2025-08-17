import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface DuckGoSearchForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  maxResults?: number;
  safeSearch?: 'off' | 'moderate' | 'strict';
  region?: string;
  searchType?: 'web' | 'images' | 'news' | 'videos';
  noHTML?: boolean;
  noRedirect?: boolean;
}

export type DuckGoSearchNodeData = BaseNodeData<DuckGoSearchForm> & { type: 'duckgosearch' };
