import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface ConfluenceForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_page' | 'update_page' | 'get_page' | 'search_pages' | 'add_comment' | 'get_spaces';
  serverUrl: string;
  username: string;
  apiToken: string;
  spaceKey?: string;
  pageId?: string;
  parentPageId?: string;
  title?: string;
  content?: string;
  searchQuery?: string;
  comment?: string;
}

export type ConfluenceNodeData = BaseNodeData<ConfluenceForm> & { type: 'confluence' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    ConfluenceNodeData: ConfluenceNodeData;
  }
}
