/**
 * Math Node - NEW ARCHITECTURE
 * 
 * Mathematical operations on numbers.
 * Supports basic arithmetic and advanced functions.
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, createInputPort, createOutputPort } from '../@flow/ports';
import { MathForm } from './types';
import { getInputFromTemplate } from '@n2flowjs/template/template';

/**
 * Math Node Definition
 */
export const MathNodeDefinition: NodeDefinition<MathForm> = {
  // Metadata
  id: 'math',
  name: 'Math',
  category: NodeCategory.TRANSFORM,
  description: 'Perform mathematical operations',
  version: '2.0.0',

  // Visual
  color: '#13c2c2',
  tags: ['math', 'calculate', 'arithmetic', 'number'],

  // Input Ports
  inputs: [
    createInputPort('value1', 'Value 1', PortType.NUMBER, {
      description: 'First value. Use {variable} for templates.',
      required: true,
    }),
    createInputPort('value2', 'Value 2', PortType.NUMBER, {
      description: 'Second value (if needed)',
      required: false,
    }),
    createInputPort('operation', 'Operation', PortType.TEXT, {
      description: 'Math operation to perform',
      required: false,
      defaultValue: 'add',
    }),
  ],

  // Output Ports
  outputs: [
    createOutputPort('result', 'Result', PortType.NUMBER, {
      description: 'Calculation result',
      required: true,
    }),
    createOutputPort('resultText', 'Result (Text)', PortType.TEXT, {
      description: 'Result as text',
      required: false,
    }),
  ],

  // Dynamic Input Ports
  getDynamicInputs: (config: MathForm) => {
    const variables = new Set<string>();
    
    if (config?.value1) {
      getInputFromTemplate(String(config.value1)).forEach(v => variables.add(v));
    }
    if (config?.value2) {
      getInputFromTemplate(String(config.value2)).forEach(v => variables.add(v));
    }
    
    const dynamicPorts = Array.from(variables)
      .sort()
      .map(varName =>
        createInputPort(varName, varName, PortType.NUMBER, {
          description: `Template variable: {${varName}}`,
          required: true,
          metadata: {
            isDynamic: true,
            sourceTemplate: 'value1/value2',
            sourceVariable: varName,
          },
        })
      );
    
    return [
      ...MathNodeDefinition.inputs,
      ...dynamicPorts,
    ];
  },

  async execute(context): Promise<NodeExecutionResult> {
    // Construct FlowExecutionContext for executor
    const { mathExecutor } = await import('./executor');
  const inputPart: { role: 'developer', content: string } = { role: 'developer', content: String(context.inputs.value1 ?? context.config.value1 ?? '') };
    const flowExecutionContext = {
      flow: context.flowState?.flow,
      flowState: context.flowState,
      input: inputPart,
    };
    const execResult = await mathExecutor.execute(context.node, flowExecutionContext);
    let resultObj;
    try {
      resultObj = typeof execResult === 'string' ? JSON.parse(execResult) : execResult;
    } catch {
      resultObj = { result: 0, resultText: '0' };
    }
    return {
      outputs: {
        result: resultObj.result,
        resultText: resultObj.resultText,
      },
      status: 'success',
      metadata: {
        operation: context.config.operation,
        value1: context.inputs.value1,
        value2: context.inputs.value2,
      },
    };
  },
};

export default MathNodeDefinition;
