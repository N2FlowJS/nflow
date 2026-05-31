/**
 * Validation schemas for N2Flow API.
 * 
 * These schemas ensure data integrity and prevent injection attacks.
 * Using simple validation without Zod to minimize dependencies.
 */

import type { FlowNode, FlowEdge, NodeData, GlobalVariable as FlowGlobalVariable } from '../flowTypes';
import { validatePlaceholdersInString } from '@n2flow/types';
import { z } from 'zod';

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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

export interface FlowExecutionRequest {
  nodes: Node[];
  edges: Edge[];
  flowId?: string;
  inputMessage?: string;
  chatHistory?: ChatMessage[];
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
  versionLabel?: string;
  isAutoSave?: boolean;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export const NodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: NodePositionSchema,
  data: z.record(z.string(), z.any()).optional(),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
  isConnectable: z.boolean().optional(),
  zIndex: z.number().optional(),
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
  style: z.record(z.string(), z.any()).optional(),
  animated: z.boolean().optional(),
});

export const GlobalVariableSchema = z.object({
  name: z.string(),
  value: z.any(),
  type: z.enum(['string', 'number', 'boolean', 'object']).optional(),
});

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  text: z.string(),
});

export const FlowExecutionRequestSchema = z.object({
  nodes: z.array(NodeSchema).min(1, 'At least one node is required'),
  edges: z.array(EdgeSchema),
  flowId: z.string().optional(),
  inputMessage: z.string().optional(),
  chatHistory: z.array(ChatMessageSchema).optional(),
  isSilent: z.boolean().optional(),
  apiKey: z.string().optional(),
  globalVariables: z.array(GlobalVariableSchema).optional(),
});

export const FlowSaveRequestSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  metadata: z.record(z.string(), z.any()).optional(),
  globalVariables: z.array(GlobalVariableSchema).optional(),
  versionLabel: z.string().optional(),
  isAutoSave: z.boolean().optional(),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }).optional(),
});

/**
 * Validates if a string contains placeholders that can be resolved either by 
 * global variables or by server environment variables.
 * Returns null if valid, or an error message if missing.
 */
export const validatePlaceholder = (value: string, globalVariables: GlobalVariable[] = []): string | null => {
  const variableNames = new Set(globalVariables.map(v => v.name.trim()));
  return validatePlaceholdersInString(value, variableNames, true);
};

/**
 * Validation utility to safely parse and validate requests
 */
export class RequestValidator {
  static validateFlowExecution(data: unknown): FlowExecutionRequest {
    return FlowExecutionRequestSchema.parse(data) as FlowExecutionRequest;
  }

  static validateFlowSave(data: unknown): FlowSaveRequest {
    return FlowSaveRequestSchema.parse(data) as FlowSaveRequest;
  }

  static validateGlobalVariables(vars: any[]): string[] {
    const errors: string[] = [];
    const names = new Set<string>();

    for (const [index, variable] of vars.entries()) {
      const result = GlobalVariableSchema.safeParse(variable);
      if (!result.success) {
        errors.push(`Global variable ${index}: ${result.error.issues.map((e: any) => e.message).join(', ')}`);
        continue;
      }

      const name = variable.name.trim();
      if (names.has(name)) {
        errors.push(`Duplicate global variable name: ${name}`);
      } else {
        names.add(name);
      }
    }

    return errors;
  }

  static validateNodes(nodes: any[]): string[] {
    const errors: string[] = [];

    if (!Array.isArray(nodes)) {
      return ['nodes must be an array'];
    }

    for (const [index, node] of nodes.entries()) {
      const result = NodeSchema.safeParse(node);
      if (!result.success) {
        errors.push(`Node ${index}: ${result.error.issues.map((e: any) => e.message).join(', ')}`);
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
    for (const [index, edge] of edges.entries()) {
      const result = EdgeSchema.safeParse(edge);
      if (!result.success) {
        errors.push(`Edge ${index}: ${result.error.issues.map((e: any) => e.message).join(', ')}`);
        continue;
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

  static validateResolvablePlaceholders(nodes: any[], vars: any[]): string[] {
    const errors: string[] = [];

    const visit = (value: unknown, path: string) => {
      if (typeof value === 'string') {
        const err = validatePlaceholder(value, vars);
        if (err) errors.push(`${path}: ${err}`);
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((entry, index) => visit(entry, `${path}[${index}]`));
        return;
      }

      if (value && typeof value === 'object') {
        for (const [key, nestedValue] of Object.entries(value)) {
          visit(nestedValue, `${path}.${key}`);
        }
      }
    };

    nodes.forEach((node, index) => {
      visit(node?.data?.params, `nodes[${index}].data.params`);
      visit(node?.data?.configSchema, `nodes[${index}].data.configSchema`);
    });

    return Array.from(new Set(errors));
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
