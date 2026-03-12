import type { CustomNodeType } from '../types';
import type { FlowValidationIssue } from './types';

export const readParamString = (node: CustomNodeType, key: string) =>
  String(
    node.data.configSchema?.find((field) => field.name === key)?.value ??
      (node.data as { params?: Record<string, unknown> }).params?.[key] ??
      '',
  ).trim();

export const validateRequiredParams = (
  node: CustomNodeType,
  requiredFields: string[],
  messageBuilder: (fieldName: string) => string,
): FlowValidationIssue[] => {
  const missing = requiredFields.filter((fieldName) => !readParamString(node, fieldName));
  return missing.map((fieldName) => ({
    level: 'error' as const,
    nodeId: node.id,
    fieldName,
    message: messageBuilder(fieldName),
  }));
};
