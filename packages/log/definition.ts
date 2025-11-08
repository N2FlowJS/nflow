import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

/**
 * Log Node Definition
 * 
 * Logs messages to console with different severity levels.
 * Supports template variables, structured data, and metadata inclusion.
 * 
 * Configuration:
 * - message: Log message (supports {variable} templates)
 * - logLevel: Severity (debug, info, warn, error)
 * - includeTimestamp: Add timestamp to log
 * - includeNodeInfo: Add node metadata
 * - includeData: Additional JSON data (supports {variable})
 * 
 * Features:
 * - Template variable support
 * - Multiple log levels
 * - Structured logging
 * - Metadata inclusion
 * 
 * Example:
 * ```json
 * {
 *   "message": "User {userId} performed action {action}",
 *   "logLevel": "info",
 *   "includeTimestamp": true,
 *   "includeNodeInfo": true
 * }
 * ```
 */
export const LogNodeDefinition: NodeDefinition = {
  id: 'log',
  name: 'Log',
  category: NodeCategory.UTILITY,
  description: 'Log messages with different severity levels and structured data',
  version: '1.0.0',

  inputs: [
    {
      id: 'message',
      name: 'Message',
      type: PortType.TEXT,
      description: 'Log message (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'textarea', placeholder: 'Enter log message...' },
    },
    {
      id: 'logLevel',
      name: 'Log Level',
      type: PortType.TEXT,
      description: 'Severity level',
      required: true,
      defaultValue: 'info',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Debug', value: 'debug' },
          { label: 'Info', value: 'info' },
          { label: 'Warning', value: 'warn' },
          { label: 'Error', value: 'error' },
        ],
      },
    },
    {
      id: 'includeTimestamp',
      name: 'Include Timestamp',
      type: PortType.BOOLEAN,
      description: 'Add timestamp to log entry',
      required: false,
      defaultValue: true,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'includeNodeInfo',
      name: 'Include Node Info',
      type: PortType.BOOLEAN,
      description: 'Add node metadata to log',
      required: false,
      defaultValue: false,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'includeData',
      name: 'Additional Data',
      type: PortType.TEXT,
      description: 'Extra JSON data (supports {variable})',
      required: false,
      metadata: { inputType: 'textarea', placeholder: '{"key": "value"}' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'output',
      name: 'Log Result',
      type: PortType.JSON,
      description: 'Log entry confirmation with metadata',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.message) {
      getInputFromTemplate(config.message as string).forEach(v => variableNames.add(v));
    }
    if (config.includeData) {
      getInputFromTemplate(config.includeData as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...LogNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars: string[] = [
      ...getInputFromTemplate(config.message as string || ''),
      ...getInputFromTemplate(config.includeData as string || ''),
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { output: { logged: false, message: 'Waiting for input variables' } },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      const message = processTemplate(config.message as string || '', vars);
      const includeData = config.includeData 
        ? processTemplate(config.includeData as string, vars) 
        : null;

      const logEntry: any = {
        level: config.logLevel || 'info',
        message: message,
        nodeId: node.id,
      };

      if (config.includeTimestamp) {
        logEntry.timestamp = new Date().toISOString();
      }

      if (config.includeNodeInfo) {
        logEntry.nodeInfo = {
          id: node.id,
          type: node.type,
          name: node.data?.label || node.id,
        };
      }

      if (includeData) {
        try {
          logEntry.data = JSON.parse(includeData);
        } catch {
          logEntry.data = includeData;
        }
      }

      // Log to console based on level
      switch (config.logLevel) {
        case 'debug':
          console.debug('[DEBUG]', logEntry);
          break;
        case 'info':
          console.info('[INFO]', logEntry);
          break;
        case 'warn':
          console.warn('[WARN]', logEntry);
          break;
        case 'error':
          console.error('[ERROR]', logEntry);
          break;
        default:
          console.log('[LOG]', logEntry);
          break;
      }

      const result = {
        logged: true,
        level: config.logLevel,
        message: message,
        timestamp: logEntry.timestamp,
      };

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, JSON.stringify(result), 'log');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          output: result
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          logLevel: config.logLevel,
          messageLength: message.length
        }
      };
    } catch (error: unknown) {
      console.error('Log node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown log error';

      return {
        outputs: {
          output: { logged: false, error: errorMessage }
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
