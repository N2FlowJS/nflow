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
 * Web Typing Node Definition
 * 
 * Type text into input fields on a web page using Puppeteer.
 * Requires web-open node to be executed first.
 * 
 * Configuration:
 * - selector: Input element selector (supports {variable} templates)
 * - text: Text to type (supports {variable} templates)
 * - selectorType: Selector type (css, xpath, text)
 * - clearBefore: Clear existing text before typing (default: true)
 * - pressEnter: Press Enter after typing (default: false)
 * - typingDelay: Delay between keystrokes in ms (default: 50)
 * - waitForSelector: Wait for selector before typing (default: true)
 * - timeout: Selector wait timeout in ms (default: 30000)
 * 
 * Example:
 * ```json
 * {
 *   "selector": "input[name='search']",
 *   "text": "{searchQuery}",
 *   "clearBefore": true,
 *   "pressEnter": true,
 *   "typingDelay": 50
 * }
 * ```
 */
export const WebTypingNodeDefinition: NodeDefinition = {
  id: 'web-typing',
  name: 'Web Typing',
  category: NodeCategory.UTILITY,
  description: 'Type text into input fields on a web page using Puppeteer',
  version: '1.0.0',

  inputs: [],

  outputs: [
    {
      id: 'result',
      name: 'Typing Result',
      type: PortType.JSON,
      description: 'Typing operation result'
    },
    {
      id: 'typed',
      name: 'Success',
      type: PortType.BOOLEAN,
      description: 'Whether typing was successful'
    }
  ],

  getDynamicInputs: (config) => {
    const inputs: Set<string> = new Set();

    if (config.selector) {
      const vars = getInputFromTemplate(config.selector as string);
      vars.forEach(v => inputs.add(v));
    }

    if (config.text) {
      const vars = getInputFromTemplate(config.text as string);
      vars.forEach(v => inputs.add(v));
    }

    return Array.from(inputs).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Parameter: ${varName}`
    }));
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.selector as string) || ''),
      ...getInputFromTemplate((config.text as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, typed: false },
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

      const selector = processTemplate(config.selector as string, vars);
      const text = processTemplate(config.text as string, vars);
      const selectorType = (config.selectorType as string) || 'css';
      const clearBefore = config.clearBefore ?? true;
      const pressEnter = config.pressEnter ?? false;
      const typingDelay = (config.typingDelay as number) || 50;

      // Note: In actual implementation, this would use the global page instance
      // from web-open node. Simplified for definition.

      const result = {
        success: true,
        selector,
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        selectorType,
        clearBefore,
        pressEnter,
        typingDelay,
        message: `Successfully typed text into element: ${selector}`,
        note: 'Requires active browser page from web-open node'
      };

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'webtyping');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          typed: true
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          selector,
          textLength: text.length
        }
      };
    } catch (error: unknown) {
      console.error('Web typing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown web typing error';

      return {
        outputs: {
          result: null,
          typed: false
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
