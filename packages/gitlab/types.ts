import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface GitLabForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_issue' | 'create_merge_request' | 'get_project' | 'get_issues' | 'create_comment';
  serverUrl: string;
  accessToken: string;
  projectId?: string;
  title?: string;
  issueIid?: string;
  sourceBranch?: string;
  targetBranch?: string;
  assigneeId?: string;
  labels?: string[];
  comment?: string;
}

export type GitLabNodeData = BaseNodeData<GitLabForm> & { type: 'gitlab' };


// Auto-added augmentation for NodeDataMap
declare module '../../models/nodeDataMap' {
  interface NodeDataMap {
    GitLabNodeData: GitLabNodeData;
  }
}
