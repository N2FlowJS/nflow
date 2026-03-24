import type { NodeValidator } from '../types';
import { readParamString, validateRequiredParams } from '../utils';

export const validateMssqlNode: NodeValidator = (node) =>
  validateRequiredParams(
    node,
    ['server', 'user', 'database', 'query'],
    (fieldName) => `MSSQL "${node.data.label}" missing ${fieldName}.`,
  );

export const validateElasticsearchNode: NodeValidator = (node) => {
  const endpoint = readParamString(node, 'endpoint');
  if (endpoint) return [];

  return [
    {
      level: 'error',
      nodeId: node.id,
      fieldName: 'endpoint',
      message: `Elasticsearch "${node.data.label}" missing endpoint URL.`,
    },
  ];
};

export const validateGitLabNode: NodeValidator = (node) =>
  validateRequiredParams(
    node,
    ['baseUrl', 'projectId', 'mergeRequestIid'],
    (fieldName) => `GitLab node "${node.data.label}" missing ${fieldName}.`,
  );

export const validateHttpRequestNode: NodeValidator = (node) => {
  const url = readParamString(node, 'url');
  if (url) return [];

  return [
    {
      level: 'error',
      nodeId: node.id,
      fieldName: 'url',
      message: `HTTP Request "${node.data.label}" missing url.`,
    },
  ];
};

export const validateCodeExecutionNode: NodeValidator = (node) => {
  const code = readParamString(node, 'code');
  if (code) return [];

  return [
    {
      level: 'warning',
      nodeId: node.id,
      fieldName: 'code',
      message: `JS Code "${node.data.label}" has empty code.`,
    },
  ];
};

export const validateConditionNode: NodeValidator = (node) => {
  const condition = readParamString(node, 'condition');
  if (condition) return [];

  return [
    {
      level: 'warning',
      nodeId: node.id,
      fieldName: 'condition',
      message: `Condition "${node.data.label}" has empty expression.`,
    },
  ];
};

export const validateSerperApiKeyNode: NodeValidator = (node) => {
  const apiKey = readParamString(node, 'apiKey');
  if (apiKey) return [];

  return [
    {
      level: 'error',
      nodeId: node.id,
      fieldName: 'apiKey',
      message: `Serper API Key node "${node.data.label}" is missing API key.`,
    },
  ];
};
