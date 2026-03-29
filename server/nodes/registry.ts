import { FlowNode, GlobalVariable } from '../flowTypes';
import { ToolDefinition } from '../integrations/tools';

export type FlowRuntimeContext = {
  inputs: Record<string, unknown[]>;
  node: FlowNode;
  isStopped: () => boolean;
  emit: (event: any) => void;
  executeToolByName: (name: string, args: Record<string, string>) => Promise<string>;
  availableTools: ToolDefinition[];
  incomingMap: Map<string, any[]>;
  nodeById: Map<string, FlowNode>;
  log: (msg: string) => void;
  globalVariables: GlobalVariable[];
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
