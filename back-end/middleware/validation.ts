/**
 * Validation schemas for N2Flow API.
 * 
 * These schemas ensure data integrity and prevent injection attacks.
 * Using simple validation without Zod to minimize dependencies.
 */

import type { FlowNode, FlowEdge, NodeData, GlobalVariable as FlowGlobalVariable } from '../flowTypes';

export interface NodePosition {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  type: string;
  position: NodePosition;
  data?: Record<string, any>;
  selected?: boolean;
  dragging?: boolean;
  isConnectable?: boolean;
  zIndex?: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: Record<string, any>;
  style?: Record<string, any>;
  animated?: boolean;
}

export interface GlobalVariable {
  name: string;
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'object';
}

export interface FlowExecutionRequest {
  nodes: Node[];
  edges: Edge[];
  inputMessage?: string;
  isSilent?: boolean;
  apiKey?: string;
  globalVariables?: GlobalVariable[];
}

export interface FlowSaveRequest {
  id?: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  metadata?: Record<string, any>;
  globalVariables?: GlobalVariable[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

/**
 * Validation utility to safely parse and validate requests
 */
export class RequestValidator {
  static validateFlowExecution(data: unknown): FlowExecutionRequest {
    if (!data || typeof data !== 'object') {
      throw new Error('Request body must be a JSON object');
    }

    const obj = data as Record<string, any>;

    // Validate required fields
    if (!Array.isArray(obj.nodes)) {
      throw new Error('nodes must be an array');
    }
    if (!Array.isArray(obj.edges)) {
      throw new Error('edges must be an array');
    }
    if (obj.nodes.length === 0) {
      throw new Error('At least one node is required');
    }

    // Validate nodes
    const nodeErrors = this.validateNodes(obj.nodes);
    if (nodeErrors.length > 0) {
      throw new Error(`Invalid nodes: ${nodeErrors.join('; ')}`);
    }

    // Validate edges
    const edgeErrors = this.validateEdges(obj.nodes, obj.edges);
    if (edgeErrors.length > 0) {
      throw new Error(`Invalid edges: ${edgeErrors.join('; ')}`);
    }

    // Validate optional fields
    if (obj.inputMessage !== undefined && typeof obj.inputMessage !== 'string') {
      throw new Error('inputMessage must be a string');
    }
    if (obj.isSilent !== undefined && typeof obj.isSilent !== 'boolean') {
      throw new Error('isSilent must be a boolean');
    }
    if (obj.apiKey !== undefined && typeof obj.apiKey !== 'string') {
      throw new Error('apiKey must be a string');
    }

    return {
      nodes: obj.nodes,
      edges: obj.edges,
      inputMessage: obj.inputMessage,
      isSilent: obj.isSilent,
      apiKey: obj.apiKey,
      globalVariables: obj.globalVariables,
    };
  }

  static validateFlowSave(data: unknown): FlowSaveRequest {
    if (!data || typeof data !== 'object') {
      throw new Error('Request body must be a JSON object');
    }

    const obj = data as Record<string, any>;

    if (!obj.name || typeof obj.name !== 'string') {
      throw new Error('Flow name is required and must be a string');
    }

    // Handle nested structure: data: { nodes, edges } or flat structure: { nodes, edges }
    let nodes = obj.nodes;
    let edges = obj.edges;
    
    if (!Array.isArray(nodes) && obj.data && typeof obj.data === 'object') {
      // Try to extract from nested data structure
      nodes = obj.data.nodes;
      edges = obj.data.edges;
    }

    if (!Array.isArray(nodes)) {
      throw new Error('nodes must be an array');
    }
    if (!Array.isArray(edges)) {
      throw new Error('edges must be an array');
    }

    // Allow empty arrays as valid (flow can have no connections initially)
    // Validate nodes and edges only if they exist
    if (nodes.length > 0) {
      const nodeErrors = this.validateNodes(nodes);
      if (nodeErrors.length > 0) {
        throw new Error(`Invalid nodes: ${nodeErrors.join('; ')}`);
      }
    }

    if (edges.length > 0) {
      const edgeErrors = this.validateEdges(nodes, edges);
      if (edgeErrors.length > 0) {
        throw new Error(`Invalid edges: ${edgeErrors.join('; ')}`);
      }
    }

    return {
      id: obj.id,
      name: obj.name,
      description: obj.description,
      nodes: nodes,
      edges: edges,
      metadata: obj.metadata,
      globalVariables: obj.globalVariables,
      viewport: obj.viewport,
    };
  }

  static validateNodes(nodes: any[]): string[] {
    const errors: string[] = [];

    if (!Array.isArray(nodes)) {
      return ['nodes must be an array'];
    }

    for (const [index, node] of nodes.entries()) {
      if (!node.id || typeof node.id !== 'string') {
        errors.push(`Node ${index}: id is required and must be a string`);
      }
      if (!node.type || typeof node.type !== 'string') {
        errors.push(`Node ${index}: type is required and must be a string`);
      }
      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push(`Node ${index}: position must have numeric x and y`);
      }
      if (node.data && typeof node.data !== 'object') {
        errors.push(`Node ${index}: data must be an object`);
      }
    }

    return errors;
  }

  static validateEdges(nodes: any[], edges: any[]): string[] {
    const errors: string[] = [];
    const nodeIds = new Set(nodes.map(n => n.id));

    if (!Array.isArray(edges)) {
      return ['edges must be an array'];
    }

    // Check for missing references
    for (const edge of edges) {
      if (!edge.id || typeof edge.id !== 'string') {
        errors.push(`Edge: id is required and must be a string`);
      }
      if (!edge.source || !nodeIds.has(edge.source)) {
        errors.push(`Edge: references non-existent source node: ${edge.source}`);
      }
      if (!edge.target || !nodeIds.has(edge.target)) {
        errors.push(`Edge: references non-existent target node: ${edge.target}`);
      }
    }

    // Check for duplicate edges
    const edgeSet = new Set();
    for (const edge of edges) {
      const key = `${edge.source}|${edge.sourceHandle || ''}=>${edge.target}|${edge.targetHandle || ''}`;
      if (edgeSet.has(key)) {
        errors.push(`Duplicate edge: ${edge.source} -> ${edge.target}`);
      }
      edgeSet.add(key);
    }

    return errors;
  }
}

/**
 * Type converters from request types to server runtime types
 */
export class TypeConverters {
  /**
   * Convert request Node[] to server FlowNode[] safely
   */
  static toFlowNodes(nodes: Node[]): FlowNode[] {
    return nodes.map((node) => ({
      id: node.id,
      type: node.type,
      data: (node.data || {}) as NodeData,
      position: node.position,
      selected: node.selected,
      dragging: node.dragging,
      isConnectable: node.isConnectable,
      zIndex: node.zIndex,
    })) as FlowNode[];
  }

  /**
   * Convert request Edge[] to server FlowEdge[] safely
   */
  static toFlowEdges(edges: Edge[]): FlowEdge[] {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      data: edge.data,
      style: edge.style,
      animated: edge.animated,
    }));
  }

  /**
   * Convert request GlobalVariable[] to server GlobalVariable[] with proper types
   */
  static toGlobalVariables(vars: GlobalVariable[]): FlowGlobalVariable[] {
    return vars.map((v) => ({
      id: v.name || `var-${Date.now()}`,
      name: v.name,
      value: String(v.value),
    }));
  }
}
