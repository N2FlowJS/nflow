import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface GitHubForm extends BaseForm {
  name: string;
  description?: string;
  action:
    | 'create_issue'
    | 'create_pull_request'
    | 'get_repository'
    | 'get_issues'
    | 'add_comment'
    | 'get_pull_requests'
    | 'merge_pull_request';
  token: string;
  owner: string;
  repository: string;
  issueNumber?: string;
  pullNumber?: string;
  title?: string;
  body?: string;
  head?: string;
  base?: string;
  comment?: string;
  labels?: string[];
  assignees?: string[];
}

export type GitHubNodeData = BaseNodeData<GitHubForm> & { type: 'github' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    GitHubNodeData: GitHubNodeData;
  }
}
