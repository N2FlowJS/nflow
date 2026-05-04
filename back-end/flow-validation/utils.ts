import type { Edge, Node } from '@xyflow/react';
import type { CustomNodeType } from '@n2flow/types';
import type { FlowValidationIssue } from './types';

type SchemaField = NonNullable<CustomNodeType['data'] extends { configSchema?: infer C } ? C : never>[number];

export const readParamString = (node: CustomNodeType, key: string) =>
  String(
    node.data.configSchema?.find((field: SchemaField) => field.name === key)?.value ??
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

/**
 * Check for orphaned nodes (nodes with no incoming or outgoing connections)
 */
export const validateNodeConnectivity = (
  nodes: Node[],
  edges: Edge[],
): FlowValidationIssue[] => {
  const issues: FlowValidationIssue[] = [];
  const connectedNodeIds = new Set<string>();

  // Collect all connected nodes
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  // Find orphaned nodes (not ChatInput or ChatOutput)
  const inputOutputTypes = ['ChatInput', 'ChatOutput'];
  for (const node of nodes) {
    const customNode = node as CustomNodeType;
    const nodeType = customNode.data?.type;
    
    // Ignore system nodes and note nodes
    if (nodeType === 'CyberNote' || customNode.type === 'cyberNote') {
      continue;
    }

    if (!connectedNodeIds.has(node.id)) {
      issues.push({
        level: 'warning' as const,
        nodeId: node.id,
        message: `Node "${customNode.data?.label || node.id}" is not connected to the flow. Consider adding edges or remove if unused.`,
      });
    }
  }

  return issues;
};

/**
 * Validate that all tool nodes have required inputs connected
 */
export const validateToolConnectivity = (
  nodes: Node[],
  edges: Edge[],
): FlowValidationIssue[] => {
  const issues: FlowValidationIssue[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n as CustomNodeType]));

  // Tool types that require input
  const toolTypes = ['HTTPRequestComponent', 'MSSQLComponent', 'elasticsearch_search', 'CodeExecutionComponent'];

  for (const node of nodes) {
    const customNode = node as CustomNodeType;
    const nodeType = customNode.data?.type;

    if (!toolTypes.includes(nodeType)) continue;

    // Check if tool has incoming edges (besides agent connections)
    const incomingEdges = edges.filter((e) => e.target === node.id);
    if (incomingEdges.length === 0) {
      issues.push({
        level: 'warning' as const,
        nodeId: node.id,
        message: `Tool node "${customNode.data?.label || node.id}" has no input connections. Connect an agent or input node.`,
      });
    }
  }

  return issues;
};

/**
 * Validate agent node has required connections
 */
export const validateAgentConnectivity = (
  nodes: Node[],
  edges: Edge[],
): FlowValidationIssue[] => {
  const issues: FlowValidationIssue[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n as CustomNodeType]));

  for (const node of nodes) {
    const customNode = node as CustomNodeType;
    if (customNode.data?.type !== 'Agent') continue;

    // Check for LLM connection
    const hasLlm = edges.some(
      (e) => e.target === node.id && (e.targetHandle === 'agent_llm' || e.targetHandle?.includes('llm'))
    );

    if (!hasLlm) {
      issues.push({
        level: 'error' as const,
        nodeId: node.id,
        message: `Agent "${customNode.data?.label || node.id}" requires a Language Model connection to the "agent_llm" input.`,
      });
    }
  }

  return issues;
};
