import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { JiraNodeData } from './types';
import { FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template-processor/templateProcessor';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';

/**
 * Handler for executing Jira nodes
 */
export async function executeJiraNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as JiraNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.summary || ''),
    ...getInputFromTemplate(form.description || ''),
    ...getInputFromTemplate(form.comment || ''),
    ...getInputFromTemplate(form.jql || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Jira operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'jira',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    // Validate required fields
    if (!form.serverUrl || !form.username || !form.apiToken) {
      throw new Error('Jira server URL, username, and API token are required');
    }

    console.log(`Executing Jira node: ${node.id} with action: ${form.action}`);

    const auth = Buffer.from(`${form.username}:${form.apiToken}`).toString('base64');
    let result: any;

    switch (form.action) {
      case 'create_issue':
        if (!form.projectKey || !form.issueType || !form.summary) {
          throw new Error('Project key, issue type, and summary are required for creating issues');
        }

        const processedSummary = processTemplate(form.summary, vars);
        const processedDescription = form.description ? processTemplate(form.description, vars) : '';
        
        result = await createJiraIssue(form.serverUrl, auth, {
          projectKey: form.projectKey,
          issueType: form.issueType,
          summary: processedSummary,
          description: processedDescription,
          assignee: form.assignee,
          priority: form.priority,
        });
        break;

      case 'update_issue':
        if (!form.issueKey) {
          throw new Error('Issue key is required for updating issues');
        }
        
        result = await updateJiraIssue(form.serverUrl, auth, form.issueKey, {
          summary: form.summary ? processTemplate(form.summary, vars) : undefined,
          description: form.description ? processTemplate(form.description, vars) : undefined,
          assignee: form.assignee,
          priority: form.priority,
        });
        break;

      case 'get_issue':
        if (!form.issueKey) {
          throw new Error('Issue key is required for getting issues');
        }
        
        result = await getJiraIssue(form.serverUrl, auth, form.issueKey);
        break;

      case 'search_issues':
        if (!form.jql) {
          throw new Error('JQL query is required for searching issues');
        }
        
        const processedJql = processTemplate(form.jql, vars);
        result = await searchJiraIssues(form.serverUrl, auth, processedJql);
        break;

      case 'add_comment':
        if (!form.issueKey || !form.comment) {
          throw new Error('Issue key and comment are required for adding comments');
        }
        
        const processedComment = processTemplate(form.comment, vars);
        result = await addJiraComment(form.serverUrl, auth, form.issueKey, processedComment);
        break;

      default:
        throw new Error(`Unsupported Jira action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Jira node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'jira');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'jira';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'jira',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('Jira execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Jira error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Jira operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'jira',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

// Helper functions for Jira API operations
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
