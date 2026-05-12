import { Node, Edge } from '@xyflow/react';

/**
 * Shared Node Data structure for both Frontend and Backend
 */
export type NodeData = {
  label: string;
  type: string;
  description?: string;
  status?: 'idle' | 'running' | 'success' | 'error' | 'cancelled';
  errorMessage?: string;
  lastInput?: any;
  lastOutput?: any;
  params?: Record<string, any>;
  configSchema?: {
    label: string;
    name: string;
    type: 'text' | 'password' | 'number' | 'select' | 'textarea' | 'boolean';
    options?: string[];
    value?: string | number | boolean;
    hidden?: boolean;
  }[];
  [key: string]: any;
};

export type GlobalVariable = {
  id: string;
  name: string;
  value: string;
};

export type CustomNodeType = Node<NodeData>;
export type CustomEdgeType = Edge;

/**
 * Standard Flow Storage Format
 */
export interface FlowData {
  nodes: CustomNodeType[];
  edges: CustomEdgeType[];
  viewport?: { x: number; y: number; zoom: number };
  globalVariables?: GlobalVariable[];
}

export interface FlowVersion {
  id: string;
  timestamp: number;
  data: FlowData;
  label?: string;
}

export interface SavedFlow {
  id: string;
  name: string;
  data?: FlowData;
  versions?: FlowVersion[];
  updatedAt: number;
  userId?: string;
}

/**
 * Unified API Response Structure
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
}

/**
 * Validation Types
 */
export type ValidationLevel = 'error' | 'warning';

export interface FlowValidationIssue {
  level: ValidationLevel;
  nodeId?: string;
  fieldName?: string;
  message: string;
}

export type ValidationLocale = 'en' | 'vi';

/**
 * Runtime Event Types for Flow Execution
 */
export type FlowRuntimeEvent =
  | { type: 'log'; message: string; timestamp: number }
  | { type: 'ping'; timestamp: number }
  | { type: 'nodeUpdate'; nodeId: string; data: Partial<NodeData>; timestamp: number }
  | { type: 'result'; output: any; timestamp: number }
  | { type: 'error'; message: string; nodeId?: string; timestamp: number }
  | { type: 'done'; output: any; timestamp: number };

/**
 * Shared Utility Helpers
 */
export const Utils = {
  /** Mask a sensitive string (API Key, Secret) */
  maskString: (v: string | unknown): string => {
    const s = String(v || '').trim();
    if (!s) return '';
    if (s.length <= 8) return `${s.slice(0, 2)}***`;
    return `${s.slice(0, 4)}***${s.slice(-4)}`;
  },

  /** Normalize API key - trim and remove Bearer */
  normalizeApiKey: (apiKey: unknown): string => {
    const raw = String(apiKey || '').trim();
    return raw.replace(/^Bearer\s+/i, '').trim();
  },

  /** Prettify component type names */
  prettifyLabel: (typeName: string): string => {
    const withoutComp = typeName.replace(/Component$/, '').replace(/_/g, ' ');
    const spaced = withoutComp.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    return spaced.replace(/\b([a-z])/g, (s) => s.toUpperCase());
  }
};

