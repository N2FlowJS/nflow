import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface GoogleSearchForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  maxResults?: number;
  safeSearch?: 'off' | 'moderate' | 'strict';
  language?: string;
  country?: string;
  apiKey?: string;
  searchEngineId?: string;
  useSystemConfig?: boolean;
}

export type GoogleSearchNodeData = BaseNodeData<GoogleSearchForm> & { type: 'googlesearch' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    GoogleSearchNodeData: GoogleSearchNodeData;
  }
}
