import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { TemplateForm } from './types';

export const PromtNode: NodeDefinition<TemplateForm> = {
  id: 'promt',
  name: 'Template (Promt)',
  category: NodeCategory.TRANSFORM,
  description: 'Renders text templates with variable substitution. Supports multiple template engines.',
  version: '1.0.0',
  icon: 'FileTextOutlined',
  color: '#eb2f96',

  // Configuration inputs (will be shown in form)
  inputs: [
    {
      id: 'templateEngine',
      name: 'Template Engine',
      type: PortType.TEXT,
      description: 'Choose the template engine to use for rendering',
      defaultValue: 'simple',
      required: true,
      metadata: {
        inputType: 'select',
        options: ['simple', 'handlebars', 'mustache'],
      },
    },
    {
      id: 'templateContent',
      name: 'Template Content',
      type: PortType.TEXT,
      description: 'Enter your template with variables like {variable}. Variables will automatically create input ports.',
      defaultValue: '',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 8,
        placeholder: 'Hello {name}, welcome to {place}!',
      },
    },
    {
      id: 'outputFormat',
      name: 'Output Format',
      type: PortType.TEXT,
      description: 'Format of the rendered output',
      defaultValue: 'text',
      required: false,
      metadata: {
        inputType: 'select',
        options: ['text', 'html', 'json'],
      },
    },
  ],

  outputs: [
    {
      id: 'output',
      name: 'output',
      type: PortType.TEXT,
      description: 'Rendered template output',
    },
  ],

  getDynamicInputs: (config) => {
    if (!config.templateContent) {
      return [];
    }
    
    const variableNames = getInputFromTemplate(config.templateContent);
    return variableNames.map((varName) => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      description: `Template variable: {${varName}}`,
      required: false,
      metadata: {
        isDynamic: true,
        sourceTemplate: `{${varName}}`,
      },
    }));
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs } = context;
    const { templateContent, templateEngine, outputFormat } = config;

    // Check if template variables are ready
    const templateVars = getInputFromTemplate(templateContent || '');
    const missingVars = templateVars.filter(varName => !inputs[varName]);
    
    if (missingVars.length > 0) {
      // Return empty output if inputs are missing (graceful handling)
      return {
        outputs: {
          output: '',
        },
        status: 'success',
        metadata: {
          waitingFor: missingVars,
          note: 'Some template variables are not provided',
        },
      };
    }

    try {
      // Prepare variables for template processing
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        vars[key] = String(inputs[key] || '');
      });

      // Render template based on engine
      let renderedContent: string;
      const template = templateContent || '';

      switch (templateEngine) {
        case 'simple':
        default:
          renderedContent = processTemplate(template, vars);
          break;

        case 'handlebars':
          // For now, use simple template processing
          // In future, could integrate Handlebars.js
          renderedContent = processTemplate(template, vars);
          break;

        case 'mustache':
          // For now, use simple template processing
          // In future, could integrate Mustache.js
          renderedContent = processTemplate(template, vars);
          break;
      }

      // Format output based on specified format
      let formattedOutput = renderedContent;
      if (outputFormat === 'json') {
        try {
          const jsonData = JSON.parse(renderedContent);
          formattedOutput = JSON.stringify(jsonData, null, 2);
        } catch {
          // If not valid JSON, wrap in quotes
          formattedOutput = JSON.stringify(renderedContent, null, 2);
        }
      }

      return {
        outputs: {
          output: formattedOutput,
        },
        status: 'success',
        metadata: {
          templateEngine,
          outputFormat,
          variablesUsed: templateVars,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {},
        status: 'error',
        error: `Template rendering failed: ${errorMessage}`,
        metadata: {
          templateEngine,
        },
      };
    }
  },
};
