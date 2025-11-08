/**
 * Display Node Executor - Refactored using BaseNodeExecutor
 * Example of migrated architecture
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { DisplayForm } from './types';

/**
 * Display node executor - shows content to user with optional formatting
 */
export class DisplayExecutor extends BaseNodeExecutor<DisplayForm> {
  constructor() {
    super({
      nodeType: 'display',
      defaultRole: 'assistant',
      checkInputReadiness: true,
      templateFields: ['content'], // Extract variables from content field
    });
  }

  /**
   * Execute display logic - format and return content
   */
  protected async executeLogic(form: DisplayForm, context: ExecutionContext): Promise<string> {
    // Process template variables in content
    const content = this.processTemplate(form.content || '', context);

    // Format content based on output format
    return this.formatContent(content, form.outputFormat);
  }

  /**
   * Format content based on specified format
   */
  private formatContent(content: string, format?: string): string {
    switch (format) {
      case 'json':
        try {
          return JSON.stringify(JSON.parse(content), null, 2);
        } catch {
          return content; // Return as-is if not valid JSON
        }
      case 'markdown':
      case 'html':
      case 'text':
      default:
        return content;
    }
  }
}

// Export singleton instance
export const displayExecutor = new DisplayExecutor();
