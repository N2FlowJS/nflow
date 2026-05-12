import type { NodeValidator } from '../types';
import { validateRequiredParams, validateSingleParam } from '../utils';

export const validateMssqlNode: NodeValidator = (n) =>
  validateRequiredParams(n, ['server', 'user', 'database', 'query'], (f) => {
    const labels: Record<string, string> = { server: 'Server Host', user: 'DB User', database: 'Database', query: 'Query' };
    return `MSSQL "${n.data.label}" missing ${labels[f] || f}.`;
  });

export const validateGitLabNode: NodeValidator = (n) =>
  validateRequiredParams(n, ['baseUrl', 'projectId', 'mergeRequestIid'], (f) => {
    const labels: Record<string, string> = { baseUrl: 'API Base URL', projectId: 'Project ID', mergeRequestIid: 'Merge Request IID' };
    return `GitLab "${n.data.label}" missing ${labels[f] || f}.`;
  });

export const validateGitHubNode: NodeValidator = (n) =>
  validateRequiredParams(n, ['baseUrl', 'repoFullName', 'pullRequestNumber'], (f) => {
    const labels: Record<string, string> = { baseUrl: 'API Base URL', repoFullName: 'Repository', pullRequestNumber: 'Pull Request #' };
    return `GitHub "${n.data.label}" missing ${labels[f] || f}.`;
  });


export const validateHttpRequestNode: NodeValidator = (n) =>
  validateSingleParam(n, 'url', 'error', `HTTP Request "${n.data.label}" missing url.`);

export const validateCodeExecutionNode: NodeValidator = (n) =>
  validateSingleParam(n, 'code', 'warning', `JS Code "${n.data.label}" has empty code.`);

export const validateConditionNode: NodeValidator = (n) =>
  validateSingleParam(n, 'condition', 'warning', `Condition "${n.data.label}" has empty expression.`);

export const validateSerperApiKeyNode: NodeValidator = (n) =>
  validateSingleParam(n, 'apiKey', 'error', `Serper node "${n.data.label}" missing API key.`);
