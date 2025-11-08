import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

/**
 * Validate Node Definition
 * 
 * Validates input data against various rules and formats.
 * Supports email, URL, phone, JSON, number, date validation, and custom regex.
 * 
 * Validation Types:
 * - email: Email address format
 * - url: Valid URL format
 * - phone: Phone number format
 * - json: Valid JSON syntax
 * - number: Numeric value
 * - date: Valid date format
 * - custom: Custom regex pattern
 * 
 * Constraints:
 * - required: Field must not be empty
 * - minLength: Minimum string length
 * - maxLength: Maximum string length
 * - customPattern: Regex pattern for custom validation
 * 
 * Example:
 * ```json
 * {
 *   "inputData": "{userEmail}",
 *   "validationType": "email",
 *   "required": true,
 *   "minLength": 5,
 *   "maxLength": 100
 * }
 * ```
 */
export const ValidateNodeDefinition: NodeDefinition = {
  id: 'validate',
  name: 'Validate',
  description: 'Validate input data against various rules (email, URL, phone, JSON, etc.)',
  version: '1.0.0',
  category: NodeCategory.LOGIC,
  inputs: [
    {
      id: 'inputData',
      name: 'Input Data',
      type: PortType.TEXT,
      description: 'Data to validate (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter data to validate...' },
    },
    {
      id: 'validationType',
      name: 'Validation Type',
      type: PortType.TEXT,
      description: 'Type of validation',
      required: true,
      defaultValue: 'email',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Email', value: 'email' },
          { label: 'URL', value: 'url' },
          { label: 'Phone', value: 'phone' },
          { label: 'JSON', value: 'json' },
          { label: 'Number', value: 'number' },
          { label: 'Date', value: 'date' },
          { label: 'Custom Regex', value: 'custom' },
        ],
      },
    },
    {
      id: 'required',
      name: 'Required',
      type: PortType.BOOLEAN,
      description: 'Field must not be empty',
      required: false,
      defaultValue: false,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'minLength',
      name: 'Min Length',
      type: PortType.NUMBER,
      description: 'Minimum string length',
      required: false,
      metadata: { inputType: 'number', min: 0 },
    },
    {
      id: 'maxLength',
      name: 'Max Length',
      type: PortType.NUMBER,
      description: 'Maximum string length',
      required: false,
      metadata: { inputType: 'number', min: 0 },
    },
    {
      id: 'customPattern',
      name: 'Custom Pattern',
      type: PortType.TEXT,
      description: 'Regex pattern for custom validation',
      required: false,
      metadata: { inputType: 'text', placeholder: '^[a-z]+$' },
    },
  ] as InputPort[],
  outputs: [
    {
      id: 'valid',
      name: 'Is Valid',
      type: PortType.BOOLEAN,
      description: 'Validation result (true/false)',
    },
    {
      id: 'message',
      name: 'Message',
      type: PortType.TEXT,
      description: 'Validation message',
    },
    {
      id: 'result',
      name: 'Result',
      type: PortType.JSON,
      description: 'Complete validation result',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();
    if (config.inputData) {
      getInputFromTemplate(config.inputData as string).forEach(v => variableNames.add(v));
    }
    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));
    return [...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    // Delegate to new executor
        const { config, inputs, flowState } = context;
    const startTime = new Date().toISOString();
    const templateVars = getInputFromTemplate((config.inputData as string) || '');
    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { valid: false, message: 'Waiting for input', result: {} },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }
    // Prepare form for executor
    const form: any = { ...config };
    templateVars.forEach((key) => {
      if (inputs?.[key] !== undefined) {
        form[key] = String(inputs[key]);
      } else if (flowState.components[key] !== undefined) {
        form[key] = flowState.components[key].output || '';
      }
    });
    // Use new executor
    const { validateExecutor } = await import('./executor');
    // Construct minimal FlowExecutionContext
    const inputPart: import('../../models/MessagePart').MessagePart = { role: 'user', content: String(context.inputs?.inputData ?? '') };
    const flowExecutionContext = {
      flow: context.flowState?.flow,
      flowState: context.flowState,
      input: inputPart,
    };
    const execResult = await validateExecutor.execute(context.node, flowExecutionContext);
    let status: 'success' | 'error' | 'in_progress' = 'success';
    if (execResult.status === 'error') status = 'error';
    else if (execResult.status === 'in_progress') status = 'in_progress';
    return {
      outputs: {
        valid: execResult.message === 'Valid email address' || execResult.message === 'Valid URL' || execResult.message === 'Valid phone number' || execResult.message === 'Valid JSON' || execResult.message === 'Valid number' || execResult.message === 'Valid date' || execResult.message === 'Matches custom pattern',
        message: execResult.message ?? '',
        result: execResult.execution?.output ?? {},
      },
      status,
      metadata: {
        startTime,
        endTime: new Date().toISOString(),
        validationType: config.validationType,
        isValid: execResult.message === 'Valid email address' || execResult.message === 'Valid URL' || execResult.message === 'Valid phone number' || execResult.message === 'Valid JSON' || execResult.message === 'Valid number' || execResult.message === 'Valid date' || execResult.message === 'Matches custom pattern',
      },
    };
  }
};
