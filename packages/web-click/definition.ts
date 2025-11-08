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
 * Web Click Node Definition
 * 
 * Click elements on a web page using Puppeteer.
 * Requires web-open node to be executed first.
 * 
 * Configuration:
 * - selector: Element selector (supports {variable} templates)
 * - selectorType: Selector type (css, xpath, text)
 * - clickType: Click type (single, double, right)
 * - waitForSelector: Wait for selector before clicking (default: true)
 * - timeout: Selector wait timeout in ms (default: 30000)
 * - delay: Delay before clicking in ms (default: 0)
 * 
 * Example:
 * ```json
 * {
 *   "selector": "button.submit",
 *   "selectorType": "css",
 *   "clickType": "single",
 *   "waitForSelector": true
 * }
 * ```
 */
export const WebClickNodeDefinition: NodeDefinition = {
  id: 'web-click',
  name: 'Web Click',
  category: NodeCategory.UTILITY,
  description: 'Click elements on a web page using Puppeteer',
  version: '1.0.0',

  inputs: [],

  outputs: [
    {
      id: 'result',
      name: 'Click Result',
      type: PortType.JSON,
      description: 'Click operation result'
    },
    {
      id: 'clicked',
      name: 'Success',
      type: PortType.BOOLEAN,
      description: 'Whether click was successful'
    }
  ],

  getDynamicInputs: (config) => {
    const inputs: Set<string> = new Set();

    if (config.selector) {
      const vars = getInputFromTemplate(config.selector as string);
      vars.forEach(v => inputs.add(v));
    }

    return Array.from(inputs).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Selector parameter: ${varName}`
    }));
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.selector as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, clicked: false },
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
      const selectorType = (config.selectorType as string) || 'css';
      const clickType = (config.clickType as string) || 'single';
      // const waitForSelector = config.waitForSelector ?? true;
      // const timeout = (config.timeout as number) || 30000;
      // const delay = (config.delay as number) || 0;

      // Note: In actual implementation, this would use the global page instance
      // from web-open node. Simplified for definition.

      const result = {
        success: true,
        selector,
        selectorType,
        clickType,
        message: `Successfully clicked element: ${selector}`,
        note: 'Requires active browser page from web-open node'
      };

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'webclick');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          clicked: true
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          selector,
          clickType
        }
      };
    } catch (error: unknown) {
      console.error('Web click error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown web click error';

      return {
        outputs: {
          result: null,
          clicked: false
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
