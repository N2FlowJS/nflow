import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface JiraForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_issue' | 'update_issue' | 'get_issue' | 'search_issues' | 'add_comment';
  serverUrl: string;
  username: string;
  apiToken: string;
  projectKey?: string;
  issueType?: string;
  summary?: string;
  issueKey?: string;
  jql?: string;
  assignee?: string;
  priority?: string;
  labels?: string[];
  comment?: string;
}

export type JiraNodeData = BaseNodeData<JiraForm> & { type: 'jira' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    JiraNodeData: JiraNodeData;
  }
}
