import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { GitHubForm } from './types';

async function createGitHubIssue(token: string, owner: string, repository: string, data: any) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function createGitHubPullRequest(token: string, owner: string, repository: string, data: any) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/pulls`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function getGitHubRepository(token: string, owner: string, repository: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function getGitHubIssues(token: string, owner: string, repository: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/issues`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function getGitHubPullRequests(token: string, owner: string, repository: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/pulls`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function addGitHubComment(token: string, owner: string, repository: string, issueNumber: string, comment: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify({ body: comment }),
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

async function mergeGitHubPullRequest(token: string, owner: string, repository: string, pullNumber: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/pulls/${pullNumber}/merge`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  return await response.json();
}

export class GitHubExecutor extends BaseNodeExecutor<GitHubForm> {
  constructor() {
    super({
      nodeType: 'github',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['title', 'body', 'comment'],
    });
  }

  protected async executeLogic(form: GitHubForm, context: ExecutionContext): Promise<any> {
  // templateVariables are available in context if needed
    let result: any;
    switch (form.action) {
      case 'create_issue':
        result = await createGitHubIssue(form.token, form.owner, form.repository, {
          title: this.processTemplate(form.title || '', context),
          body: form.body ? this.processTemplate(form.body, context) : '',
          labels: form.labels,
          assignees: form.assignees,
        });
        break;
      case 'create_pull_request':
        result = await createGitHubPullRequest(form.token, form.owner, form.repository, {
          title: this.processTemplate(form.title || '', context),
          body: form.body ? this.processTemplate(form.body, context) : '',
          head: form.head,
          base: form.base,
          labels: form.labels,
          assignees: form.assignees,
        });
        break;
      case 'get_repository':
        result = await getGitHubRepository(form.token, form.owner, form.repository);
        break;
      case 'get_issues':
        result = await getGitHubIssues(form.token, form.owner, form.repository);
        break;
      case 'get_pull_requests':
        result = await getGitHubPullRequests(form.token, form.owner, form.repository);
        break;
      case 'add_comment':
        result = await addGitHubComment(form.token, form.owner, form.repository, form.issueNumber!, this.processTemplate(form.comment || '', context));
        break;
      case 'merge_pull_request':
        result = await mergeGitHubPullRequest(form.token, form.owner, form.repository, form.pullNumber!);
        break;
      default:
        throw new Error(`Unsupported GitHub action: ${form.action}`);
    }
    return result;
  }
}

export default GitHubExecutor;
