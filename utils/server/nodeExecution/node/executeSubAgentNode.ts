import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { SubAgentNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { FlowStateDispatcher } from '../flowStateDispatcher';

/**
 * Handler for executing Sub Agent nodes
 */
export async function executeSubAgentNode(
  node: FlowNode,
  { flow, flowState, input, history }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as SubAgentNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  try {
    // Validate required parameters
    if (!form.agentId || form.agentId.trim() === '') {
      throw new Error('No target agent specified');
    }

    console.log(`Executing sub-agent: ${form.agentId} (${form.agentName || 'Unnamed'})`);

    // Prepare variables for the sub-agent
    const subAgentVariables: Record<string, any> = {};

    // Process variable mappings if they exist
    if (form.variables) {
      Object.entries(form.variables).forEach(([key, valueTemplate]) => {
        if (typeof valueTemplate === 'string') {
          // Extract variables from template
          const templateInputs = getInputFromTemplate(valueTemplate);
          const templateVars: Record<string, string> = {};

          templateInputs.forEach((inputKey) => {
            if (flowState.components[inputKey] !== undefined) {
              templateVars[inputKey] = flowState.components[inputKey].output || '';
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

    // Add current context if inheritance is enabled
    if (form.inheritContext) {
      subAgentVariables['_parentContext'] = {
        currentInput: input.content,
        variables: flowState.variables,
        history: history?.slice(-5) || [], // Include last 5 messages for context
      };
    }

    console.log(`Sub-agent variables:`, subAgentVariables);

    // Execute the sub-agent (this would typically call another API endpoint)
    const subAgentResponse = await executeSubAgent(form.agentId, {
      input: input.content || '',
      variables: subAgentVariables,
      inheritContext: form.inheritContext || false,
      timeout: (form.timeout || 300) * 1000, // Convert to milliseconds
    });

    console.log(`Sub-agent response:`, subAgentResponse);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, subAgentResponse.output, 'subagent');
      dispatcher.setCurrentNode(node);

      // Merge any variables returned by the sub-agent
      if (subAgentResponse.variables) {
        dispatcher.updateVariables(subAgentResponse.variables);
      }

      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = subAgentResponse.output;
      flowState.components[node.id]['type'] = 'subagent';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;

      // Merge variables
      if (subAgentResponse.variables) {
        flowState.variables = { ...flowState.variables, ...subAgentResponse.variables };
      }

      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'subagent',
        role: 'assistant',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: subAgentResponse.output,
      },
    };
  } catch (error: unknown) {
    console.error('Sub-agent execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown sub-agent error';

    return {
      nextNodes: [],
      status: 'error',
      message: `Sub-agent execution failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'subagent',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

/**
 * Execute a sub-agent by running the flow directly instead of API calls
 */
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
    const { prisma } = await import('../../../../lib/prisma');
    const { parseFlowConfig } = await import('../../parseFlowConfig');
    const { createInitialFlowState } = await import('../../createInitialFlowState');
    const { executeFlow } = await import('../executeFlow');

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

    // Prepare variables for sub-agent execution
    const subAgentVariables = { ...options.variables };

    // Create initial flow state for the sub-agent
    const flowState = createInitialFlowState({
      beginNode: beginNode as any,
      variables: subAgentVariables,
      flowConfig,
    });

    console.log(`Sub-agent flow state initialized for: ${agent.name}`);

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
        (result) => {
          executionResults.push(result);

          // Update final output with the latest result
          if (result.execution?.output) {
            finalOutput = result.execution.output;
          }

          // If execution is completed, resolve
          if (result.status === 'completed') {
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
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });

    // Wait for execution to complete or timeout
    await executeWithTimeout;

    // Get the final flow state to extract any updated variables
    const finalResult = executionResults[executionResults.length - 1];
    const finalVariables = finalResult?.flowState?.variables || {};

    console.log(`Sub-agent execution completed. Output: ${finalOutput}`);

    return {
      output: finalOutput || 'Sub-agent execution completed with no output',
      variables: finalVariables,
    };
  } catch (error: unknown) {
    console.error('Sub-agent direct execution error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`Sub-agent execution failed: ${String(error)}`);
  }
}
