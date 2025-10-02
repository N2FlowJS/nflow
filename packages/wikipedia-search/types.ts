import { BaseForm, BaseNodeData } from '@n2flowjs/flow/type';

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
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    WikipediaSearchNodeData: WikipediaSearchNodeData;
  }
}
