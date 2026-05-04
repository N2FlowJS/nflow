import type { NodeValidationRuleKey } from '../node-registry';
import type { NodeValidator } from './types';
import { validateAgentNode } from './rules/agent';
import { validatePromptTemplateNode } from './rules/templates';
import {
  validateCodeExecutionNode,
  validateConditionNode,
  validateElasticsearchNode,
  validateGitLabNode,
  validateHttpRequestNode,
  validateMssqlNode,
  validateSerperApiKeyNode,
  validateGitHubNode
} from './rules/tools';

export const validatorsByRuleKey: Record<NodeValidationRuleKey, NodeValidator> = {
  'agent-llm-link': validateAgentNode,
  'prompt-template-not-empty': validatePromptTemplateNode,
  'mssql-required': validateMssqlNode,
  'elasticsearch-endpoint-required': validateElasticsearchNode,
  'gitlab-required': validateGitLabNode,
  'github-required': validateGitHubNode,
  'http-url-required': validateHttpRequestNode,
  'code-required': validateCodeExecutionNode,
  'condition-required': validateConditionNode,
  'serper-api-key-required': validateSerperApiKeyNode,
};
