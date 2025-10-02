import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';

/**
 * Delay Node Definition
 * 
 * Pauses flow execution for a specified duration.
 * Useful for rate limiting, waiting for external processes, or scheduling delays.
 * 
 * Configuration:
 * - duration: Time to wait (number, 1-3600)
 * - unit: Time unit (seconds, minutes, hours)
 * 
 * Safety:
 * - Maximum delay: 1 hour
 * - Validation of duration
 * - Pass-through of previous output
 * 
 * Features:
 * - Configurable time units
 * - Safety limits
 * - Simple pause mechanism
 * 
 * Example:
 * ```json
 * {
 *   "duration": 5,
 *   "unit": "seconds"
 * }
 * ```
 */
export const DelayNodeDefinition: NodeDefinition = {
  id: 'delay',
  name: 'Delay',
  category: NodeCategory.UTILITY,
  description: 'Pause flow execution for a specified duration (seconds/minutes/hours)',
  version: '1.0.0',

  inputs: [
    {
      id: 'input',
      name: 'Input',
      type: PortType.ANY,
      required: false,
      description: 'Optional input to pass through after delay',
      metadata: { inputType: 'text' },
    },
    {
      id: 'duration',
      name: 'Duration',
      type: PortType.NUMBER,
      description: 'Time to wait (1-3600)',
      required: true,
      defaultValue: 1,
      metadata: { inputType: 'number', min: 1, max: 3600 },
    },
    {
      id: 'unit',
      name: 'Time Unit',
      type: PortType.TEXT,
      description: 'Unit of time for the delay',
      required: true,
      defaultValue: 'seconds',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Seconds', value: 'seconds' },
          { label: 'Minutes', value: 'minutes' },
          { label: 'Hours', value: 'hours' },
        ],
      },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'output',
      name: 'Output',
      type: PortType.ANY,
      description: 'Passed-through input after delay completion',
    },
  ] as OutputPort[],

  async execute(context: NodeExecutionContext): Promise<any> {
    const { config, inputs, dispatcher, node } = context;
    const startTime = new Date().toISOString();

    try {
      const duration = config.duration as number;
      const unit = config.unit as string;

      // Validate required fields
      if (!duration || duration <= 0) {
        throw new Error('Invalid delay duration specified');
      }

      // Convert duration to milliseconds
      let delayMs: number;
      switch (unit) {
        case 'minutes':
          delayMs = duration * 60 * 1000;
          break;
        case 'hours':
          delayMs = duration * 60 * 60 * 1000;
          break;
        case 'seconds':
        default:
          delayMs = duration * 1000;
          break;
      }

      // Limit maximum delay to 1 hour for safety
      const maxDelayMs = 60 * 60 * 1000; // 1 hour
      if (delayMs > maxDelayMs) {
        throw new Error(
          `Delay duration too long. Maximum allowed is 1 hour, requested: ${duration} ${unit}`
        );
      }

      console.log(`Executing Delay node: ${node.id} for ${duration} ${unit} (${delayMs}ms)`);

      // Execute the delay
      await new Promise(resolve => setTimeout(resolve, delayMs));

      // Pass through the previous output
      const inputContent = inputs?.input || 'Delay completed';
      const outputText = typeof inputContent === 'string' 
        ? inputContent 
        : JSON.stringify(inputContent);

      console.log(`Delay node completed: ${node.id}`);

      // Update dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, outputText, 'delay');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          output: outputText
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          duration,
          unit,
          delayMs
        }
      };
    } catch (error: unknown) {
      console.error('Delay execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown delay error';

      return {
        outputs: {
          output: `Error: ${errorMessage}`
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};
