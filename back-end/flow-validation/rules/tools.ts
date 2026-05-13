import { ValidationRules } from '@n2flow/types';
import type { NodeValidator } from '../types';

export const validateMssqlNode: NodeValidator = (n) =>
  ValidationRules.validateRequiredParams(n, ['server', 'user', 'database', 'query']);

export const validateGitLabNode: NodeValidator = (n) =>
  ValidationRules.validateRequiredParams(n, ['baseUrl', 'projectId', 'mergeRequestIid']);

export const validateGitHubNode: NodeValidator = (n) =>
  ValidationRules.validateRequiredParams(n, ['baseUrl', 'repoFullName', 'pullRequestNumber']);

export const validateHttpRequestNode: NodeValidator = (n) =>
  ValidationRules.validateSingleParam(n, 'url', 'error', `HTTP Request "${n.data.label}" missing url.`);

export const validateCodeExecutionNode: NodeValidator = (n) =>
  ValidationRules.validateSingleParam(n, 'code', 'warning', `JS Code "${n.data.label}" has empty code.`);

export const validateConditionNode: NodeValidator = (n) =>
  ValidationRules.validateSingleParam(n, 'condition', 'warning', `Condition "${n.data.label}" has empty expression.`);

export const validateSerperApiKeyNode: NodeValidator = (n) =>
  ValidationRules.validateSingleParam(n, 'apiKey', 'error', `Serper node "${n.data.label}" missing API key.`);

export const validateElasticsearchNode: NodeValidator = (n) =>
  ValidationRules.validateRequiredParams(n, ['nodeUrl', 'indexName']);
