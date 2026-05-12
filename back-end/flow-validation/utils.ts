import type { Edge, Node } from '@xyflow/react';
import type { CustomNodeType } from '@n2flow/types';
import type { FlowValidationIssue } from './types';

export const readParamString = (node: CustomNodeType, key: string) =>
  String(
    node.data.configSchema?.find((f: any) => f.name === key)?.value ??
      (node.data as any).params?.[key] ??
      '',
  ).trim();

export const validateRequiredParams = (
  node: CustomNodeType,
  requiredFields: string[],
  messageBuilder: (fieldName: string) => string,
): FlowValidationIssue[] =>
  requiredFields
    .filter((field) => !readParamString(node, field))
    .map((fieldName) => ({
      level: 'error',
      nodeId: node.id,
      fieldName,
      message: messageBuilder(fieldName),
    }));

export const validateSingleParam = (
  node: CustomNodeType,
  field: string,
  level: FlowValidationIssue['level'],
  message: string,
): FlowValidationIssue[] =>
  readParamString(node, field)
    ? []
    : [{ level, nodeId: node.id, fieldName: field, message }];

/**
 * Check for orphaned nodes (nodes with no incoming or outgoing connections)
 */
export const validateNodeConnectivity = (
  nodes: Node[],
  edges: Edge[],
): FlowValidationIssue[] => {
  const connectedNodeIds = new Set(edges.flatMap((e) => [e.source, e.target]));

  return nodes
    .filter((node) => {
      const customNode = node as CustomNodeType;
      // Skip note nodes
      if (customNode.data?.type === 'CyberNote' || customNode.type === 'cyberNote') return false;
      return !connectedNodeIds.has(node.id);
    })
    .map((node) => ({
      level: 'warning',
      nodeId: node.id,
      message: `Node "${(node as CustomNodeType).data?.label || node.id}" is not connected to the flow.`,
    }));
};

/**
 * Validate that all tool nodes have required inputs connected
 */
export const validateToolConnectivity = (
  nodes: Node[],
  edges: Edge[],
): FlowValidationIssue[] => {
  const toolTypes = ['HTTPRequestComponent', 'MSSQLComponent', 'elasticsearch_search', 'CodeExecutionComponent'];

  return nodes
    .filter((node) => {
      const type = (node as CustomNodeType).data?.type;
      if (!toolTypes.includes(type)) return false;
      return !edges.some((e) => e.target === node.id);
    })
    .map((node) => ({
      level: 'warning',
      nodeId: node.id,
      message: `Tool node "${(node as CustomNodeType).data?.label || node.id}" has no input connections.`,
    }));
};
