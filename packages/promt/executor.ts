/**
 * Template/Prompt Node Executor - Refactored using BaseNodeExecutor
 * Renders templates with variable substitution
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { TemplateForm } from './types';

/**
 * Template node executor - renders templates with variables
 */
export class TemplateExecutor extends BaseNodeExecutor<TemplateForm> {
  constructor() {
    super({
      nodeType: 'template',
      defaultRole: 'assistant',
      checkInputReadiness: true,
      templateFields: ['templateContent'],
    });
  }

  /**
   * Execute template rendering logic
   */
  protected async executeLogic(form: TemplateForm, context: ExecutionContext): Promise<string> {
    // Add flow variables to template context
    const enhancedVars = {
      ...context.templateVariables,
      ...context.flowState.variables,
    };

    // Render content based on template engine
    let renderedContent: string;
    const templateContent = form.templateContent || '';

    switch (form.templateEngine) {
      case 'handlebars':
        // For now, use simple template processing
        // TODO: Integrate Handlebars.js in future
        renderedContent = this.processTemplateWithVars(templateContent, enhancedVars);
        break;

      case 'mustache':
        // For now, use simple template processing
        // TODO: Integrate Mustache.js in future
        renderedContent = this.processTemplateWithVars(templateContent, enhancedVars);
        break;

      case 'simple':
      default:
        renderedContent = this.processTemplateWithVars(templateContent, enhancedVars);
        break;
    }

    // Format output based on specified format
    return this.formatOutput(renderedContent, form.outputFormat);
  }

  /**
   * Process template with custom variables
   */
  private processTemplateWithVars(template: string, vars: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      const placeholder = `{${key}}`;
      result = result.split(placeholder).join(String(value));
    }
    return result;
  }

  /**
   * Format output based on format type
   */
  private formatOutput(content: string, format: 'text' | 'html' | 'json'): string {
    switch (format) {
      case 'json':
        try {
          const jsonData = JSON.parse(content);
          return JSON.stringify(jsonData, null, 2);
        } catch {
          // If not valid JSON, wrap in quotes
          return JSON.stringify(content, null, 2);
        }

      case 'html':
      case 'text':
      default:
        return content;
    }
  }
}

// Export singleton instance
export const templateExecutor = new TemplateExecutor();

// Export as promtExecutor for backward compatibility (package name is 'promt')
export const promtExecutor = templateExecutor;
