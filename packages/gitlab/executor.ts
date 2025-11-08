import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { GitLabForm } from './types';

async function createGitLabIssue(serverUrl: string, accessToken: string, data: any) {
  const response = await fetch(`${serverUrl.replace(/\/$/, '')}/api/v4/projects/${data.projectId}/issues`, {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      assignee_id: data.assigneeId,
      labels: data.labels,
    }),
  });
  if (!response.ok) throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function createGitLabMergeRequest(serverUrl: string, accessToken: string, data: any) {
  const response = await fetch(`${serverUrl.replace(/\/$/, '')}/api/v4/projects/${data.projectId}/merge_requests`, {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      source_branch: data.sourceBranch,
      target_branch: data.targetBranch,
      assignee_id: data.assigneeId,
    }),
  });
  if (!response.ok) throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function getGitLabProject(serverUrl: string, accessToken: string, projectId: string) {
  const response = await fetch(`${serverUrl.replace(/\/$/, '')}/api/v4/projects/${projectId}`, {
    method: 'GET',
    headers: {
      'PRIVATE-TOKEN': accessToken,
    },
  });
  if (!response.ok) throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function getGitLabIssues(serverUrl: string, accessToken: string, projectId: string) {
  const response = await fetch(`${serverUrl.replace(/\/$/, '')}/api/v4/projects/${projectId}/issues`, {
    method: 'GET',
    headers: {
      'PRIVATE-TOKEN': accessToken,
    },
  });
  if (!response.ok) throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function createGitLabComment(serverUrl: string, accessToken: string, projectId: string, issueIid: string, comment: string) {
  const response = await fetch(`${serverUrl.replace(/\/$/, '')}/api/v4/projects/${projectId}/issues/${issueIid}/notes`, {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: comment }),
  });
  if (!response.ok) throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

export class GitLabExecutor extends BaseNodeExecutor<GitLabForm> {
  constructor() {
    super({
      nodeType: 'gitlab',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['title', 'description', 'comment'],
    });
  }

  protected async executeLogic(form: GitLabForm, context: ExecutionContext): Promise<any> {
    let result: any;
    switch (form.action) {
      case 'create_issue':
        result = await createGitLabIssue(form.serverUrl, form.accessToken, {
          projectId: form.projectId,
          title: this.processTemplate(form.title || '', context),
          description: form.description ? this.processTemplate(form.description, context) : '',
          assigneeId: form.assigneeId,
          labels: form.labels,
        });
        break;
      case 'create_merge_request':
        result = await createGitLabMergeRequest(form.serverUrl, form.accessToken, {
          projectId: form.projectId,
          title: this.processTemplate(form.title || '', context),
          description: form.description ? this.processTemplate(form.description, context) : '',
          sourceBranch: form.sourceBranch,
          targetBranch: form.targetBranch,
          assigneeId: form.assigneeId,
        });
        break;
      case 'get_project':
        result = await getGitLabProject(form.serverUrl, form.accessToken, form.projectId!);
        break;
      case 'get_issues':
        result = await getGitLabIssues(form.serverUrl, form.accessToken, form.projectId!);
        break;
      case 'create_comment':
        result = await createGitLabComment(form.serverUrl, form.accessToken, form.projectId!, form.issueIid!, this.processTemplate(form.comment || '', context));
        break;
      default:
        throw new Error(`Unsupported GitLab action: ${form.action}`);
    }
    return result;
  }
}

export default GitLabExecutor;
