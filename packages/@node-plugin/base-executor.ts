/**
 * Base Node Executor - Abstract base class for all node executors
 * Provides unified execution flow with common patterns extracted
 */

import { FlowNode } from '@n2flowjs/flow';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';
import { ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow/type';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';
import { findNextNodes } from '@n2flowjs/flow/find-next-node';

/**
 * Execution context for business logic
 */
export interface ExecutionContext {
  node: FlowNode;
  flowState: any;
  flow: any;
  dispatcher?: FlowStateDispatcher;
  resolvedInputs: Record<string, any>;
  templateVariables: Record<string, string>;
}

/**
 * Configuration for executor behavior
 */
export interface ExecutorConfig {
  /** Node type identifier for result */
  nodeType: string;
  /** Default role for nodeInfo */
  defaultRole?: 'developer' | 'assistant' | 'system' | 'user';
  /** Whether to check template variable readiness */
  checkInputReadiness?: boolean;
  /** Fields to extract template variables from */
  templateFields?: string[];
}

/**
 * Base executor implementing common execution patterns
 */
export abstract class BaseNodeExecutor<TForm = any> {
  constructor(protected config: ExecutorConfig) {}

  /**
   * Get the node type for this executor
   */
  get nodeType(): string {
    return this.config.nodeType;
  }

  /**
   * Main execution entry point - implements common flow
   */
  async execute(
    node: FlowNode,
    { flow, flowState }: FlowExecutionContext,
    dispatcher?: FlowStateDispatcher
  ): Promise<ExecutionResult> {
    const data = node.data as { form?: TForm };
    const form = data.form || ({} as TForm);
    const startTime = new Date().toISOString();

    try {
      // 1. Extract template variables
      const templateVars = this.extractTemplateVariables(form);

      // 2. Check input readiness if enabled
      if (this.config.checkInputReadiness && templateVars.length > 0) {
        const ready = isNodeReady(templateVars, flowState);
        if (!ready) {
          return this.createWaitingResult(node, flowState, startTime);
        }
      }

      // 3. Resolve input values from flowState
      const resolvedInputs = this.resolveInputValues(templateVars, flowState);

      // 4. Build template variable map
      const templateVariables = this.buildTemplateVariables(templateVars, flowState);

      // 5. Execute business logic (implemented by subclass)
      const context: ExecutionContext = {
        node,
        flowState,
        flow,
        dispatcher,
        resolvedInputs,
        templateVariables,
      };
      const output = await this.executeLogic(form, context);

      // 6. Update state
      const finalState = this.updateState(node, output, flowState, dispatcher);

      // 7. Find next nodes
      const nextNodes = findNextNodes(flow, node.id);

      // 8. Create and return result
      return this.createSuccessResult(node, form, output, finalState, nextNodes, startTime);
    } catch (error) {
      return this.createErrorResult(node, form, error, flowState, startTime);
    }
  }

  /**
   * Business logic to be implemented by subclasses
   * @param form - Node configuration form data
   * @param context - Execution context with resolved inputs
   * @returns Output string to be stored in flowState
   */
  protected abstract executeLogic(form: TForm, context: ExecutionContext): Promise<string>;

  /**
   * Extract template variables from form fields
   * Override if custom extraction logic needed
   */
  protected extractTemplateVariables(form: TForm): string[] {
    const variables: string[] = [];
    const fields = this.config.templateFields || [];

    for (const field of fields) {
      const value = (form as any)[field];
      if (typeof value === 'string') {
        const fieldVars = getInputFromTemplate(value);
        variables.push(...fieldVars);
      }
    }

    return [...new Set(variables)]; // Remove duplicates
  }

  /**
   * Resolve input values from flowState components
   */
  protected resolveInputValues(inputs: string[], flowState: any): Record<string, any> {
    const resolved: Record<string, any> = {};
    for (const key of inputs) {
      if (flowState.components?.[key] !== undefined) {
        resolved[key] = flowState.components[key].output || flowState.components[key];
      } else if (flowState.variables?.[key] !== undefined) {
        resolved[key] = flowState.variables[key];
      }
    }
    return resolved;
  }

  /**
   * Build template variable map for processTemplate
   */
  protected buildTemplateVariables(inputs: string[], flowState: any): Record<string, string> {
    const vars: Record<string, string> = {};
    for (const key of inputs) {
      if (flowState.components?.[key] !== undefined) {
        vars[key] = String(flowState.components[key].output || '');
      } else if (flowState.variables?.[key] !== undefined) {
        vars[key] = String(flowState.variables[key]);
      }
    }
    return vars;
  }

  /**
   * Process template string with variables
   */
  protected processTemplate(template: string, context: ExecutionContext): string {
    return processTemplate(template, context.templateVariables);
  }

  /**
   * Update flowState using dispatcher or direct mutation
   */
  protected updateState(
    node: FlowNode,
    output: string,
    flowState: any,
    dispatcher?: FlowStateDispatcher
  ): any {
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, output, this.config.nodeType);
      dispatcher.setCurrentNode(node);
      return dispatcher.getState();
    } else {
      // Legacy fallback
      if (!flowState.components[node.id]) {
        flowState.components[node.id] = {};
      }
      flowState.components[node.id].output = output;
      flowState.components[node.id].type = this.config.nodeType;
      flowState.components[node.id].executionTime = Date.now();
      flowState.currentNode = node;
      return flowState;
    }
  }

  /**
   * Get node name from form or fallback to node.id
   */
  protected getNodeName(node: FlowNode, form: any): string {
    return form?.name || node.data?.label || node.id;
  }

  /**
   * Get node role from form or use default
   */
  protected getNodeRole(form: any): 'developer' | 'assistant' | 'system' | 'user' {
    return form?.role || this.config.defaultRole || 'developer';
  }

  /**
   * Create waiting result when inputs not ready
   */
  protected createWaitingResult(node: FlowNode, flowState: any, startTime: string): ExecutionResult {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input data',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: this.config.nodeType,
        role: this.config.defaultRole || 'developer',
      },
      execution: {
        output: 'Waiting for required inputs',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime,
      },
    };
  }

  /**
   * Create success result
   */
  protected createSuccessResult(
    node: FlowNode,
    form: any,
    output: string,
    flowState: any,
    nextNodes: string[],
    startTime: string
  ): ExecutionResult {
    return {
      status: nextNodes.length > 0 ? 'in_progress' : 'ended',
      nextNodes,
      flowState,
      nodeInfo: {
        id: node.id,
        name: this.getNodeName(node, form),
        type: this.config.nodeType,
        role: this.getNodeRole(form),
      },
      execution: {
        nodeId: node.id,
        nodeName: this.getNodeName(node, form),
        startTime,
        endTime: new Date().toISOString(),
        output,
      },
    };
  }

  /**
   * Create error result
   */
  protected createErrorResult(
    node: FlowNode,
    form: any,
    error: unknown,
    flowState: any,
    startTime: string
  ): ExecutionResult {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${this.config.nodeType}] Error in node ${node.id}:`, error);

    return {
      status: 'error',
      message: errorMessage,
      nextNodes: [],
      flowState,
      nodeInfo: {
        id: node.id,
        name: this.getNodeName(node, form),
        type: this.config.nodeType,
        role: this.getNodeRole(form),
      },
      execution: {
        nodeId: node.id,
        nodeName: this.getNodeName(node, form),
        startTime,
        endTime: new Date().toISOString(),
        output: `Error: ${errorMessage}`,
      },
    };
  }
}
