/**
 * Log Node Executor - Refactored using BaseNodeExecutor
 * Demonstrates handling of multiple template fields and log levels
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { LogForm } from './types';
import { FlowNode } from '@n2flowjs/flow';

/**
 * Log node executor - logs messages with different severity levels
 */
export class LogExecutor extends BaseNodeExecutor<LogForm> {
  constructor() {
    super({
      nodeType: 'log',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['message', 'metadata'], // Extract from both fields
    });
  }

  /**
   * Execute log logic - format and output log message
   */
  protected async executeLogic(form: LogForm, context: ExecutionContext): Promise<string> {
    // Process template in message
    const message = this.processTemplate(form.message || '', context);

    // Build metadata from includeData
    let metadata: any = {};
    if (form.includeData) {
      try {
        const dataStr = this.processTemplate(form.includeData, context);
        metadata.data = dataStr;
      } catch {
        metadata.data = form.includeData;
      }
    }

    // Add timestamp if requested
    if (form.includeTimestamp) {
      metadata.timestamp = new Date().toISOString();
    }

    // Add node info if requested
    if (form.includeNodeInfo) {
      metadata.nodeId = context.node.id;
      metadata.nodeName = context.node.data?.label || context.node.id;
    }

    // Get log level
    const level = form.logLevel || 'info';

    // Format log output
    const logOutput = this.formatLogOutput(level, message, metadata, context.node);

    // Log to console
    this.logToConsole(level, message, metadata, context.node.id);

    return logOutput;
  }

  /**
   * Format log output as JSON or text
   */
  private formatLogOutput(level: string, message: string, metadata: any, node: FlowNode): string {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      nodeId: node.id,
      nodeName: node.data?.label || node.id,
      message,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    return JSON.stringify(logEntry, null, 2);
  }

  /**
   * Log to console with appropriate level
   */
  private logToConsole(level: string, message: string, metadata: any, nodeId: string): void {
    const prefix = `[${level.toUpperCase()}] [Node: ${nodeId}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, metadata);
        break;
      case 'warn':
        console.warn(prefix, message, metadata);
        break;
      case 'debug':
        console.debug(prefix, message, metadata);
        break;
      case 'info':
      default:
        console.log(prefix, message, metadata);
    }
  }

}


// Export singleton instance
export const logExecutor = new LogExecutor();
