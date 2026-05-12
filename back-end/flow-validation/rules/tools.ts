import type { NodeValidator } from '../types';
import { validateRequiredParams, validateSingleParam } from '../utils';

export const validateMssqlNode: NodeValidator = (n) =>
  validateRequiredParams(n, ['server', 'user', 'database', 'query'], (f) => `MSSQL "${n.data.label}" missing ${f}.`);

export const validateElasticsearchNode: NodeValidator = (n) =>
  validateSingleParam(n, 'endpoint', 'error', `Elasticsearch "${n.data.label}" missing endpoint URL.`);

export const validateGitLabNode: NodeValidator = (n) =>
  validateRequiredParams(n, ['baseUrl', 'projectId', 'mergeRequestIid'], (f) => `GitLab "${n.data.label}" missing ${f}.`);

export const validateGitHubNode: NodeValidator = (n) =>
  validateRequiredParams(n, ['baseUrl', 'repoFullName', 'pullRequestNumber'], (f) => `GitHub "${n.data.label}" missing ${f}.`);

export const validateHttpRequestNode: NodeValidator = (n) =>
  validateSingleParam(n, 'url', 'error', `HTTP Request "${n.data.label}" missing url.`);

export const validateCodeExecutionNode: NodeValidator = (n) =>
  validateSingleParam(n, 'code', 'warning', `JS Code "${n.data.label}" has empty code.`);

export const validateConditionNode: NodeValidator = (n) =>
  validateSingleParam(n, 'condition', 'warning', `Condition "${n.data.label}" has empty expression.`);

export const validateSerperApiKeyNode: NodeValidator = (n) =>
  validateSingleParam(n, 'apiKey', 'error', `Serper node "${n.data.label}" missing API key.`);
