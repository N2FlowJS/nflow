import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { JiraForm } from './types';

async function createJiraIssue(serverUrl: string, auth: string, issueData: any) {
  const response = await fetch(`${serverUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        project: { key: issueData.projectKey },
        summary: issueData.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: issueData.description || ''
            }]
          }]
        },
        issuetype: { name: issueData.issueType },
        ...(issueData.assignee && { assignee: { name: issueData.assignee } }),
        ...(issueData.priority && { priority: { name: issueData.priority } }),
      },
    }),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Jira API error: ${response.status} ${errorData}`);
  }
  return await response.json();
}

async function updateJiraIssue(serverUrl: string, auth: string, issueKey: string, updateData: any) {
  const fields: any = {};
  if (updateData.summary) fields.summary = updateData.summary;
  if (updateData.description) {
    fields.description = {
      type: 'doc',
      version: 1,
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: updateData.description
        }]
      }]
    };
  }
  if (updateData.assignee) fields.assignee = { name: updateData.assignee };
  if (updateData.priority) fields.priority = { name: updateData.priority };
  const response = await fetch(`${serverUrl}/rest/api/3/issue/${issueKey}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Jira API error: ${response.status} ${errorData}`);
  }
  return { success: true, message: 'Issue updated successfully' };
}

async function getJiraIssue(serverUrl: string, auth: string, issueKey: string) {
  const response = await fetch(`${serverUrl}/rest/api/3/issue/${issueKey}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Jira API error: ${response.status} ${errorData}`);
  }
  return await response.json();
}

async function searchJiraIssues(serverUrl: string, auth: string, jql: string) {
  const response = await fetch(`${serverUrl}/rest/api/3/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jql: jql,
      maxResults: 50,
    }),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Jira API error: ${response.status} ${errorData}`);
  }
  return await response.json();
}

async function addJiraComment(serverUrl: string, auth: string, issueKey: string, comment: string) {
  const response = await fetch(`${serverUrl}/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      body: {
        type: 'doc',
        version: 1,
        content: [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: comment
          }]
        }]
      }
    }),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Jira API error: ${response.status} ${errorData}`);
  }
  return await response.json();
}

export class JiraExecutor extends BaseNodeExecutor<JiraForm> {
  constructor() {
    super({
      nodeType: 'jira',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['summary', 'description', 'comment', 'jql'],
    });
  }

  protected async executeLogic(form: JiraForm, context: ExecutionContext): Promise<any> {
    const auth = Buffer.from(`${form.username}:${form.apiToken}`).toString('base64');
    let result: any;
    switch (form.action) {
      case 'create_issue':
        result = await createJiraIssue(form.serverUrl, auth, {
          projectKey: form.projectKey,
          issueType: form.issueType,
          summary: this.processTemplate(form.summary || '', context),
          description: form.description ? this.processTemplate(form.description, context) : '',
          assignee: form.assignee,
          priority: form.priority,
        });
        break;
      case 'update_issue':
        result = await updateJiraIssue(form.serverUrl, auth, form.issueKey!, {
          summary: form.summary ? this.processTemplate(form.summary, context) : undefined,
          description: form.description ? this.processTemplate(form.description, context) : undefined,
          assignee: form.assignee,
          priority: form.priority,
        });
        break;
      case 'get_issue':
        result = await getJiraIssue(form.serverUrl, auth, form.issueKey!);
        break;
      case 'search_issues':
        result = await searchJiraIssues(form.serverUrl, auth, this.processTemplate(form.jql!, context));
        break;
      case 'add_comment':
        result = await addJiraComment(form.serverUrl, auth, form.issueKey!, this.processTemplate(form.comment!, context));
        break;
      default:
        throw new Error(`Unsupported Jira action: ${form.action}`);
    }
    return result;
  }
}

export default JiraExecutor;
