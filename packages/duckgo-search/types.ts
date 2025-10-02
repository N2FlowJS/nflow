import { BaseForm, BaseNodeData } from '@n2flowjs/flow/type';

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


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    DuckGoSearchNodeData: DuckGoSearchNodeData;
  }
}
