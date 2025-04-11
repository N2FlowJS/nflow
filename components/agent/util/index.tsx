import { BeginNodeData, CategorizeNodeData, GenerateNodeData, InterfaceNodeData, NodeData, RetrievalNodeData } from '../types/flowTypes';

export * from './NODE_REGISTRY'
export * from './parseFlowConfig'
export * from './connectionRules'

export function isBeginNodeData(data: NodeData): data is BeginNodeData {
    return data.type === 'begin';
  }
  
  export function isInterfaceNodeData(data: NodeData): data is InterfaceNodeData {
    return data.type === 'interface';
  }
  
  export function isGenerateNodeData(data: NodeData): data is GenerateNodeData {
    return data.type === 'generate';
  }
  
  export function isCategorizeNodeData(data: NodeData): data is CategorizeNodeData {
    return data.type === 'categorize';
  }
  
  export function isRetrievalNodeData(data: NodeData): data is RetrievalNodeData {
    return data.type === 'retrieval';
  }
