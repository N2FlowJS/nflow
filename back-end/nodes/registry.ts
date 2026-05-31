import { FlowNode, GlobalVariable, ChatMessage } from '../flowTypes';
import { ToolDefinition } from '../tools';

export type FlowRuntimeContext = {
  inputs: Record<string, unknown[]>;
  node: FlowNode;
  isStopped: () => boolean;
  /** AbortSignal that fires when the flow is cancelled or a node fails */
  signal: AbortSignal;
  emit: (event: any) => void;
  executeToolByName: (name: string, args: Record<string, string>) => Promise<string>;
  availableTools: ToolDefinition[];
  incomingMap: Map<string, any[]>;
  nodeById: Map<string, FlowNode>;
  /** Live results map: access completed upstream node outputs */
  nodeResults: Map<string, unknown>;
  log: (msg: string) => void;
  globalVariables: GlobalVariable[];
  onEvent?: (event: any) => void;
  chatHistory?: ChatMessage[];
};

export type NodeHandler = (
  ctx: FlowRuntimeContext
) => Promise<unknown> | unknown;

export class NodeRegistry {
  private static handlers: Record<string, NodeHandler> = {};

  static register(type: string, handler: NodeHandler) {
    this.handlers[type] = handler;
  }

  static getHandler(type: string): NodeHandler | undefined {
    return this.handlers[type];
  }

  static listRegisteredTypes(): string[] {
    return Object.keys(this.handlers);
  }
}
