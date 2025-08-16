import { DecisionNodeData, GenerateNodeData, RetrievalNodeData, InterfaceNodeData, NodeData } from '../../models/flowTypes';

// Generic type predicate for any node data with a specific type string
function hasType(data: any, type: string): boolean {
  return !!data && typeof data === 'object' && data.type === type;
}

export function isDecisionNodeData(data: any): data is DecisionNodeData {
  return hasType(data, 'decision');
}

export function isGenerateNodeData(data: any): data is GenerateNodeData {
  return hasType(data, 'generate');
}

export function isRetrievalNodeData(data: any): data is RetrievalNodeData {
  return hasType(data, 'retrieval');
}

export function isInterfaceNodeData(data: any): data is InterfaceNodeData {
  return hasType(data, 'interface');
}

export function isNodeData(data: any): data is NodeData {
  return !!data && typeof data === 'object' && typeof data.type === 'string';
}
