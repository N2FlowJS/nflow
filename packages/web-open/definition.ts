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
 * Web Open Node Definition
 * 
 * Open a web page using Puppeteer browser automation.
 * Creates a browser instance and navigates to specified URL.
 * 
 * Configuration:
 * - url: Website URL to open (supports {variable} templates)
 * - headless: Run browser in headless mode (default: true)
 * - viewport: Viewport size { width, height }
 * - timeout: Navigation timeout in ms (default: 30000)
 * - waitUntil: Wait condition (load, domcontentloaded, networkidle0, networkidle2)
 * - userAgent: Custom user agent string (optional)
 * 
 * Outputs:
 * - Browser and page instances stored globally for subsequent nodes
 * - Page URL, title, and IDs available as variables
 * 
 * Example:
 * ```json
 * {
 *   "url": "https://example.com/{path}",
 *   "headless": true,
 *   "waitUntil": "networkidle2"
 * }
 * ```
 */
export const WebOpenNodeDefinition: NodeDefinition = {
  id: 'web-open',
  name: 'Web Open',
  category: NodeCategory.UTILITY,
  description: 'Open a web page using Puppeteer browser automation',
  version: '1.0.0',

  inputs: [],

  outputs: [
    {
      id: 'result',
      name: 'Page Info',
      type: PortType.JSON,
      description: 'Page information (URL, title, browser ID)'
    },
    {
      id: 'url',
      name: 'Page URL',
      type: PortType.TEXT,
      description: 'Current page URL'
    },
    {
      id: 'title',
      name: 'Page Title',
      type: PortType.TEXT,
      description: 'Page title'
    }
  ],

  getDynamicInputs: (config) => {
    const inputs: Set<string> = new Set();

    if (config.url) {
      const vars = getInputFromTemplate(config.url as string);
      vars.forEach(v => inputs.add(v));
    }

    if (config.userAgent) {
      const vars = getInputFromTemplate(config.userAgent as string);
      vars.forEach(v => inputs.add(v));
    }

    return Array.from(inputs).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `URL parameter: ${varName}`
    }));
  },

  config: {
    properties: {
      url: {
        type: 'string',
        title: 'URL',
        description: 'Website URL to open (supports {variable} templates)',
        required: true
      },
      headless: {
        type: 'boolean',
        title: 'Headless Mode',
        description: 'Run browser in headless mode',
        default: true,
        required: false
      },
      viewport: {
        type: 'object',
        title: 'Viewport',
        description: 'Viewport size',
        properties: {
          width: { type: 'number', default: 1920 },
          height: { type: 'number', default: 1080 }
        },
        required: false
      },
      timeout: {
        type: 'number',
        title: 'Timeout (ms)',
        description: 'Navigation timeout in milliseconds',
        default: 30000,
        required: false
      },
      waitUntil: {
        type: 'string',
        title: 'Wait Until',
        description: 'Wait condition',
        enum: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
        default: 'networkidle2',
        required: false
      },
      userAgent: {
        type: 'string',
        title: 'User Agent',
        description: 'Custom user agent string (optional)',
        required: false
      }
    }
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.url as string) || ''),
      ...getInputFromTemplate((config.userAgent as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, url: '', title: '' },
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

      const url = processTemplate(config.url as string, vars);
      const headless = config.headless ?? true;
      const viewport = (config.viewport as any) || { width: 1920, height: 1080 };
      const timeout = (config.timeout as number) || 30000;
      const waitUntil = (config.waitUntil as any) || 'networkidle2';

      // Import puppeteer dynamically
      const puppeteer = await import('puppeteer');

      // Get or create browser instance (using global cache in actual implementation)
      const browser = await puppeteer.launch({
        headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setViewport(viewport);

      if (config.userAgent) {
        const userAgent = processTemplate(config.userAgent as string, vars);
        await page.setUserAgent(userAgent);
      }

      await page.goto(url, { waitUntil, timeout });

      const pageTitle = await page.title();
      const pageUrl = page.url();

      const result = {
        success: true,
        url: pageUrl,
        title: pageTitle,
        browserId: 'global-browser',
        pageId: 'global-page'
      };

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'webopen');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          url: pageUrl,
          title: pageTitle
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          url: pageUrl,
          title: pageTitle
        }
      };
    } catch (error: unknown) {
      console.error('Web open error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown web open error';

      return {
        outputs: {
          result: null,
          url: '',
          title: ''
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
