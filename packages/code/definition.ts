/**
 * Code Node - NEW ARCHITECTURE
 * 
 * Execute custom JavaScript code in a sandboxed environment.
 * Access to flow state, variables, and safe globals.
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, createInputPort, createOutputPort } from '../@flow/ports';
import { CodeForm } from './types';

/**
 * Execute code safely with timeout
 */

/**
 * Code Node Definition
 */
export const CodeNodeDefinition: NodeDefinition<CodeForm> = {
  // Metadata
  id: 'code',
  name: 'Code',
  category: NodeCategory.TRANSFORM,
  description: 'Execute custom JavaScript code',
  version: '2.0.0',

  // Visual
  color: '#faad14',
  tags: ['code', 'javascript', 'custom', 'script', 'function'],

  // Input Ports
  inputs: [
    createInputPort('code', 'Code', PortType.TEXT, {
      description: 'JavaScript code to execute',
      required: true,
    }),
  ],

  // Output Ports
  outputs: [
    createOutputPort('result', 'Result', PortType.ANY, {
      description: 'Code execution result',
      required: true,
    }),
    createOutputPort('resultText', 'Result (Text)', PortType.TEXT, {
      description: 'Result as JSON string',
      required: false,
    }),
  ],

  // Execution Logic
  async execute({ node, flowState, dispatcher }): Promise<NodeExecutionResult> {
    // Delegate to new executor for unified execution
    const { CodeExecutor } = await import('./executor');
    const executor = new CodeExecutor();
    const execResult = await executor.execute(
      node,
      {
        flow: flowState?.flow || {},
        flowState,
        input: { role: 'user', content: '' },
      },
      dispatcher
    );
    // Map output to NodeExecutionResult shape
    let outputs: { result: any; resultText: string } = { result: null, resultText: '' };
    let status: 'success' | 'error' | 'in_progress' = 'success';
    if (execResult.status === 'error') status = 'error';
    else if (execResult.status === 'in_progress') status = 'in_progress';
    else status = 'success';
    if (execResult.execution && execResult.execution.output) {
      try {
        outputs.resultText = execResult.execution.output;
        outputs.result = JSON.parse(execResult.execution.output);
      } catch {
        outputs.resultText = execResult.execution.output;
        outputs.result = execResult.execution.output;
      }
    }
    return {
      outputs,
      status,
      metadata: {
        ...execResult.execution,
        message: execResult.message,
      },
    };
  },
};

export default CodeNodeDefinition;
