import type { FlowNode } from '../../flowTypes';

export type ToolDefinition = {
  type: 'tool';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  nodeId: string;
};

export type ExecutionOptions = {
  toolDef?: ToolDefinition;
  log: (msg: string) => void;
  inputs?: Record<string, unknown[]>;
};

export type ToolHandler = (
  node: FlowNode,
  args: Record<string, string>,
  options: ExecutionOptions,
) => Promise<string> | string;

export interface ToolRegistration {
  handler: ToolHandler;
  requiresEmbedding?: boolean;
  resultParser?: (result: string) => any;
}

export class ToolRegistry {
  private static registeredTools: Record<string, ToolRegistration> = {};

  static register(type: string, registration: ToolRegistration | ToolHandler) {
    if (typeof registration === 'function') {
      this.registeredTools[type] = { handler: registration };
    } else {
      this.registeredTools[type] = registration;
    }
  }

  static getHandler(type: string): ToolHandler | undefined {
    return this.registeredTools[type]?.handler;
  }

  static getRegistration(type: string): ToolRegistration | undefined {
    return this.registeredTools[type];
  }

  static isTool(type: string): boolean {
    return !!this.registeredTools[type];
  }

  static listRegisteredTypes(): string[] {
    return Object.keys(this.registeredTools);
  }
}
