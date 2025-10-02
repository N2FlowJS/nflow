import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

export const SubAgentNode: NodeDefinition = {
  id: 'subagent',
  name: 'Sub Agent',
  category: NodeCategory.AI,
  description: 'Executes another agent as a sub-task, passing variables and inheriting context',
  version: '1.0.0',

  inputs: [
    {
      id: 'input',
      name: 'input',
      type: PortType.TEXT,
      description: 'Input to pass to the sub-agent',
    },
  ],

  outputs: [
    {
      id: 'output',
      name: 'output',
      type: PortType.TEXT,
      description: 'Output from the sub-agent',
    },
    {
      id: 'variables',
      name: 'variables',
      type: PortType.OBJECT,
      description: 'Variables returned by the sub-agent',
    },
  ],

  config: {
    properties: {
      agentId: {
        type: 'string',
        title: 'Agent ID',
        description: 'ID of the agent to execute as sub-agent',
      },
      agentName: {
        type: 'string',
        title: 'Agent Name',
        description: 'Display name of the sub-agent (for reference)',
      },
      variables: {
        type: 'object',
        title: 'Variables',
        description: 'Variables to pass to the sub-agent (supports template variables)',
        additionalProperties: {
          type: 'string',
        },
        default: {},
      },
      inheritContext: {
        type: 'boolean',
        title: 'Inherit Context',
        description: 'Pass current context (input, variables, history) to sub-agent',
        default: false,
      },
      timeout: {
        type: 'number',
        title: 'Timeout (seconds)',
        description: 'Maximum execution time for the sub-agent',
        default: 300,
        minimum: 10,
        maximum: 3600,
      },
    },
  },

  getDynamicInputs: (config: any) => {
    // Extract template variables from all variable mappings
    const variableNames: string[] = [];
    if (config.variables && typeof config.variables === 'object') {
      Object.values(config.variables).forEach((valueTemplate) => {
        if (typeof valueTemplate === 'string') {
          variableNames.push(...getInputFromTemplate(valueTemplate));
        }
      });
    }

    return variableNames.map((varName: string) => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      description: `Template variable: {${varName}}`,
      required: false,
      metadata: {
        isDynamic: true,
        sourceTemplate: `{${varName}}`,
      },
    }));
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs } = context;
    const { agentId, agentName, variables, inheritContext, timeout } = config;

    try {
      // Validate required parameters
      if (!agentId || String(agentId).trim() === '') {
        throw new Error('No target agent specified');
      }

      // Prepare variables for the sub-agent
      const subAgentVariables: Record<string, any> = {};

      // Process variable mappings
      if (variables && typeof variables === 'object') {
        Object.entries(variables).forEach(([key, valueTemplate]) => {
          if (typeof valueTemplate === 'string') {
            // Extract variables from template
            const templateInputs = getInputFromTemplate(valueTemplate);
            const templateVars: Record<string, string> = {};

            templateInputs.forEach((inputKey) => {
              if (inputs[inputKey] !== undefined) {
                templateVars[inputKey] = String(inputs[inputKey]);
              }
            });

            // Process the template and assign to sub-agent variable
            subAgentVariables[key] = processTemplate(valueTemplate, templateVars);
          } else {
            // Direct value assignment
            subAgentVariables[key] = valueTemplate;
          }
        });
      }

      // Get input text
      const inputText = String(inputs.input || '');

      // Add current context if inheritance is enabled
      if (inheritContext) {
        subAgentVariables['_parentContext'] = {
          currentInput: inputText,
          variables: inputs,
        };
      }

      console.log(`Executing sub-agent: ${agentId} (${agentName || 'Unnamed'})`);

      // Execute the sub-agent
      const subAgentResponse = await executeSubAgent(agentId, {
        input: inputText,
        variables: subAgentVariables,
        inheritContext: inheritContext || false,
        timeout: (timeout || 300) * 1000, // Convert to milliseconds
      });

      return {
        outputs: {
          output: subAgentResponse.output,
          variables: subAgentResponse.variables || {},
        },
        status: 'success',
        metadata: {
          agentId,
          agentName: agentName || 'Unnamed',
          executionTime: Date.now(),
          variablesCount: Object.keys(subAgentVariables).length,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          output: '',
          variables: {},
        },
        status: 'error',
        error: `Sub-agent execution failed: ${errorMessage}`,
        metadata: {
          agentId,
        },
      };
    }
  },
};

// Helper function
async function executeSubAgent(
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
    const { executeFlow } = await import('../../utils/server/nodeExecution/executeFlow');

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
    const beginNode = flowConfig.nodes.find((node: any) => node.type === 'begin');
    if (!beginNode) {
      throw new Error(`Sub-agent flow has no begin node: ${agentId}`);
    }

    // Create initial flow state for the sub-agent
    const flowState = createInitialFlowState({
      beginNode: beginNode as any,
      variables: options.variables,
      flowConfig,
    });

    // Prepare input message for sub-agent
    const inputMessage = {
      role: 'user' as const,
      content: options.input,
    };

    // Collect execution results
    let finalOutput = '';
    const executionResults: any[] = [];

    // Execute the sub-agent flow with timeout
    const executeWithTimeout = new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Sub-agent execution timed out after ${options.timeout / 1000} seconds`));
      }, options.timeout);

      executeFlow(
        flowConfig,
        flowState,
        inputMessage,
        [], // Empty history for sub-agent
        (result: any) => {
          executionResults.push(result);

          // Update final output with the latest result
          if (result.execution?.output) {
            finalOutput = result.execution.output;
          }

          // If execution is completed, resolve
          if (result.status === 'ended') {
            clearTimeout(timeoutId);
            resolve();
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
          resolve();
        })
        .catch((error: any) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });

    // Wait for execution to complete or timeout
    await executeWithTimeout;

    // Get the final flow state to extract any updated variables
    const finalResult = executionResults[executionResults.length - 1];
    const finalVariables = finalResult?.flowState?.variables || {};

    return {
      output: finalOutput || 'Sub-agent execution completed with no output',
      variables: finalVariables,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Sub-agent execution failed: ${String(error)}`);
  }
}
