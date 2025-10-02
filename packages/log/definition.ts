import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
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

  inputs: [],

  outputs: [
    {
      id: 'output',
      name: 'Log Result',
      type: PortType.JSON,
      description: 'Log entry confirmation with metadata'
    }
  ],

  getDynamicInputs: (config) => {
    const inputs: Set<string> = new Set();

    if (config.message) {
      const vars = getInputFromTemplate(config.message as string);
      vars.forEach(v => inputs.add(v));
    }

    if (config.includeData) {
      const dataVars = getInputFromTemplate(config.includeData as string);
      dataVars.forEach(v => inputs.add(v));
    }

    return Array.from(inputs).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`
    }));
  },

  config: {
    properties: {
      message: {
        type: 'string',
        title: 'Message',
        description: 'Log message (supports {variable} templates)',
        required: true
      },
      logLevel: {
        type: 'string',
        title: 'Log Level',
        description: 'Severity level',
        enum: ['debug', 'info', 'warn', 'error'],
        default: 'info',
        required: true
      },
      includeTimestamp: {
        type: 'boolean',
        title: 'Include Timestamp',
        description: 'Add timestamp to log entry',
        default: true,
        required: false
      },
      includeNodeInfo: {
        type: 'boolean',
        title: 'Include Node Info',
        description: 'Add node metadata to log',
        default: false,
        required: false
      },
      includeData: {
        type: 'string',
        title: 'Additional Data',
        description: 'Extra JSON data (supports {variable})',
        required: false
      }
    }
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
