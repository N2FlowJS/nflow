/**
 * Display Node - NEW ARCHITECTURE
 * 
 * Display formatted content to the user.
 * Supports multiple output formats and modal display.
 * 
 * This node handles:
 * - Template variable substitution in content
 * - Multiple output formats (text, markdown, JSON, HTML)
 * - Optional modal display
 * - Content formatting and pretty-printing
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports';
import { DisplayForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

/**
 * Display Node Definition
 */
export const DisplayNodeDefinition: NodeDefinition<DisplayForm> = {
  // Metadata
  id: 'display',
  name: 'Display',
  category: NodeCategory.OUTPUT,
  description: 'Display formatted content to the user with template support',
  version: '2.0.0',

  // Visual
  color: '#52c41a',
  tags: ['display', 'output', 'show', 'render', 'format'],

  // Input Ports (Configuration)
  inputs: [
    {
      id: 'content',
      name: 'Content',
      type: PortType.TEXT,
      defaultValue: '',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 8,
        placeholder: 'Enter content to display. Use {variable} for dynamic values.',
      },
    },
    {
      id: 'outputFormat',
      name: 'Output Format',
      type: PortType.TEXT,
      defaultValue: 'text',
      required: false,
      metadata: {
        inputType: 'select',
        options: ['text', 'markdown', 'json', 'html'],
      },
    },
  ],

  // Output Ports
  outputs: [
    {
      id: 'displayedContent',
      name: 'Displayed Content',
      type: PortType.TEXT,
      description: 'The formatted content that was displayed',
    },
    {
      id: 'format',
      name: 'Format Used',
      type: PortType.TEXT,
      description: 'The output format applied',
    },
  ],

  // Dynamic Input Ports - Generated from content template variables
  getDynamicInputs: (config: DisplayForm) => {
    const variableNames = new Set<string>();
    
    // Extract from content
    if (config?.content) {
      getInputFromTemplate(config.content).forEach(v => variableNames.add(v));
    }
    
    // Create InputPort for each variable
    return Array.from(variableNames)
      .sort()
      .map(varName => ({
        id: varName,
        name: varName,
        type: PortType.TEXT,
        description: `Template variable from content: {${varName}}`,
        required: false,
        metadata: {
          isDynamic: true,
          sourceTemplate: `{${varName}}`,
        },
      }));
  },

  // Execution Logic
  async execute({ node, config, inputs, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Get config values (prefer inputs over config)
      const content = inputs.content || config.content;
      const outputFormat = inputs.outputFormat || config.outputFormat || 'text';
      const showAsModal = inputs.showAsModal ?? config.showAsModal ?? false;

      // Validate content
      if (!content || content.trim() === '') {
        throw new Error('Content is required for display');
      }

      // Extract template variables
      const templateVars = new Set<string>();
      getInputFromTemplate(content).forEach(v => templateVars.add(v));

      // Build variable map from inputs
      const vars: Record<string, string> = {};
      templateVars.forEach(varName => {
        if (inputs[varName] !== undefined) {
          vars[varName] = String(inputs[varName]);
        }
      });

      // Process template
      const processedContent = processTemplate(content, vars);

      // Format content based on output format
      let formattedContent = processedContent;
      switch (outputFormat) {
        case 'json':
          try {
            // Try to parse and pretty-print JSON
            const parsed = JSON.parse(processedContent);
            formattedContent = JSON.stringify(parsed, null, 2);
          } catch {
            // If not valid JSON, return as-is
            formattedContent = processedContent;
          }
          break;
        case 'markdown':
        case 'html':
        case 'text':
        default:
          formattedContent = processedContent;
          break;
      }

      console.log(`[Display] ${node.id} - Format: ${outputFormat}, Modal: ${showAsModal}`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, formattedContent, 'display');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          displayedContent: formattedContent,
          format: outputFormat,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          outputFormat,
          showAsModal,
          contentLength: formattedContent.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          displayedContent: '',
          format: '',
        },
        status: 'error',
        error: `Display failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default DisplayNodeDefinition;
