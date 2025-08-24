import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface WikipediaSearchForm extends BaseForm {
  name: string;
  description?: string;
  query: string;
  maxResults?: number;
  language?: string;
  summaryOnly?: boolean;
}

export type WikipediaSearchNodeData = BaseNodeData<WikipediaSearchForm> & { type: 'wikipediasearch' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    WikipediaSearchNodeData: WikipediaSearchNodeData;
  }
}
