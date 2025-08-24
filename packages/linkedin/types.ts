import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface LinkedInForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_post' | 'get_profile' | 'get_company_info' | 'create_article' | 'get_connections';
  accessToken: string;
  personId?: string;
  companyId?: string;
  postText?: string;
  articleTitle?: string;
  articleContent?: string;
  mediaUrl?: string;
  visibility?: 'public' | 'connections';
}

export type LinkedInNodeData = BaseNodeData<LinkedInForm> & { type: 'linkedin' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    LinkedInNodeData: LinkedInNodeData;
  }
}
