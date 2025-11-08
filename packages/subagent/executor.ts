import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { SubAgentForm } from './types';

/**
 * Sub-Agent Node Executor
 * 
 * Executes another agent/flow as a sub-agent with variable passing and context inheritance.
 */
export class SubAgentExecutor extends BaseNodeExecutor<SubAgentForm> {
  constructor() {
    super({
      nodeType: 'subagent',
      defaultRole: 'assistant',
      checkInputReadiness: false,
      templateFields: [], // Variables are handled dynamically
    });
  }

  /**
   * Execute sub-agent logic with nested flow execution
   */
  protected async executeLogic(
    form: SubAgentForm,
    context: ExecutionContext
  ): Promise<string> {
    // Validate required parameters
    if (!form.agentId || form.agentId.trim() === '') {
      throw new Error('No target agent specified');
    }

    console.log(`Executing sub-agent: ${form.agentId} (${form.agentName || 'Unnamed'})`);

    // Prepare variables for the sub-agent
    const subAgentVariables = this.prepareSubAgentVariables(form, context);

    console.log(`Sub-agent variables:`, subAgentVariables);

    // Execute the sub-agent
    const subAgentResponse = await this.executeSubAgent(form.agentId, {
      input: context.resolvedInputs.content || '',
      variables: subAgentVariables,
      inheritContext: form.inheritContext || false,
      timeout: (form.timeout || 300) * 1000, // Convert to milliseconds
    });

    console.log(`Sub-agent response:`, subAgentResponse);

    // Merge any variables returned by the sub-agent into flow state
    if (subAgentResponse.variables) {
      if (context.dispatcher) {
        context.dispatcher.updateVariables(subAgentResponse.variables);
      } else {
        context.flowState.variables = {
          ...context.flowState.variables,
          ...subAgentResponse.variables,
        };
      }
    }

    return subAgentResponse.output;
  }

  /**
   * Prepare variables for sub-agent execution
   */
  private prepareSubAgentVariables(
    form: SubAgentForm,
    context: ExecutionContext
  ): Record<string, any> {
    const subAgentVariables: Record<string, any> = {};

    // Process variable mappings if they exist
    if (form.variables) {
      Object.entries(form.variables).forEach(([key, valueTemplate]) => {
        if (typeof valueTemplate === 'string') {
          // Process the template with template variables
          subAgentVariables[key] = this.processTemplate(valueTemplate, context);
        } else {
          // Direct value assignment
          subAgentVariables[key] = valueTemplate;
        }
      });
    }

    // Add current context if inheritance is enabled
    if (form.inheritContext) {
      subAgentVariables['_parentContext'] = {
        currentInput: context.resolvedInputs.content,
        variables: context.flowState.variables,
        history: context.resolvedInputs.history?.slice(-5) || [], // Include last 5 messages for context
      };
    }

    return subAgentVariables;
  }

  /**
   * Execute a sub-agent by running the flow directly
   */
  private async executeSubAgent(
    agentId: string,
    options: {
      input: string;
      variables: Record<string, any>;
      inheritContext: boolean;
      timeout: number;
    }
  ): Promise<{ output: string; variables?: Record<string, any> }> {
    try {
      // Import required modules for direct flow execution
      const { prisma } = await import('../../lib/prisma');
      const { parseFlowConfig } = await import('../../utils/server/parseFlowConfig');
      const { createInitialFlowState } = await import('../../utils/server/createInitialFlowState');

      console.log(`Executing sub-agent directly: ${agentId}`);

      // Fetch the agent and its flow configuration from database
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: {
          id: true,
          name: true,
          flowConfig: true,
        },
      });

      if (!agent) {
        throw new Error(`Sub-agent not found: ${agentId}`);
      }

      if (!agent.flowConfig) {
        throw new Error(`Sub-agent has no flow configuration: ${agentId}`);
      }

      // Parse the flow configuration
      const flowConfig = parseFlowConfig(agent.flowConfig);

      if (!flowConfig.nodes || flowConfig.nodes.length === 0) {
        throw new Error(`Sub-agent flow is empty: ${agentId}`);
      }

      // Find the begin node
      const beginNode = flowConfig.nodes.find((node) => node.type === 'begin');
      if (!beginNode) {
        throw new Error(`Sub-agent flow has no begin node: ${agentId}`);
      }

      // Create initial flow state for the sub-agent
      const flowState = createInitialFlowState({
        beginNode: beginNode as any,
        variables: options.variables,
        flowConfig,
      });

      console.log(`Sub-agent flow state initialized for: ${agent.name}`);

      // Prepare input message for sub-agent
      const inputMessage = {
        role: 'user' as const,
        content: options.input,
      };

      // Execute with timeout and collect results
      const result = await this.executeWithTimeout(
        flowConfig,
        flowState,
        inputMessage,
        options.timeout
      );

      console.log(`Sub-agent execution completed. Output: ${result.output}`);

      return result;
    } catch (error: unknown) {
      console.error('Sub-agent direct execution error:', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(`Sub-agent execution failed: ${String(error)}`);
    }
  }

  /**
   * Execute flow with timeout protection
   */
  private async executeWithTimeout(
    flowConfig: any,
    flowState: any,
    inputMessage: any,
    timeout: number
  ): Promise<{ output: string; variables?: Record<string, any> }> {
    // Import executeFlow at the start
    const { executeFlow } = await import('../../utils/server/nodeExecution/executeFlow');
    
    let finalOutput = '';
    const executionResults: any[] = [];

    return new Promise<{ output: string; variables?: Record<string, any> }>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Sub-agent execution timed out after ${timeout / 1000} seconds`));
      }, timeout);

      executeFlow(
        flowConfig,
        flowState,
        inputMessage,
        [], // Empty history for sub-agent
        (result) => {
          executionResults.push(result);

          // Update final output with the latest result
          if (result.execution?.output) {
            finalOutput = result.execution.output;
          }

          // If execution is completed, resolve
          if (result.status === 'ended') {
            clearTimeout(timeoutId);
            const finalResult = executionResults[executionResults.length - 1];
            resolve({
              output: finalOutput || 'Sub-agent execution completed with no output',
              variables: finalResult?.flowState?.variables || {},
            });
          }

          // If there's an error, reject
          if (result.status === 'error') {
            clearTimeout(timeoutId);
            reject(new Error(result.message || 'Sub-agent execution failed'));
          }
        }
      )
        .then(() => {
          clearTimeout(timeoutId);
          const finalResult = executionResults[executionResults.length - 1];
          resolve({
            output: finalOutput || 'Sub-agent execution completed with no output',
            variables: finalResult?.flowState?.variables || {},
          });
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
}

// Export singleton instance
export const subAgentExecutor = new SubAgentExecutor();
