import { BaseBrowserExecutor } from '../@node-plugin/base-browser-executor';
import { ExecutionContext } from '../@node-plugin/base-executor';
import { WebClickForm } from './types';

/**
 * Web Click Node Executor
 * 
 * Clicks on elements in a web page using CSS selectors, XPath, or text matching.
 */
export class WebClickExecutor extends BaseBrowserExecutor<WebClickForm> {
  constructor() {
    super({
      nodeType: 'web-click',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['selector'],
    });
  }

  /**
   * Execute web click logic - find and click element
   */
  protected async executeLogic(
    form: WebClickForm,
    context: ExecutionContext
  ): Promise<string> {
    // Ensure page is available
    const page = this.ensurePageAvailable();

    // Process template fields
    const selector = this.processTemplate(form.selector, context);
    const selectorType = form.selectorType || 'css';
    const clickType = form.clickType || 'single';
    const waitForSelector = form.waitForSelector ?? true;
    const timeout = form.timeout || 30000;
    const delay = form.delay || 0;

    // Wait for and get element
    const element = await this.waitAndGetElement(page, selector, selectorType, {
      waitForSelector,
      timeout,
    });

    // Type guard to ensure we have an ElementHandle
    if (!('click' in element)) {
      throw new Error('Invalid element handle');
    }

    // Add delay before clicking if specified
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Perform click based on type
    switch (clickType) {
      case 'double':
        await element.click({ clickCount: 2 });
        break;
      case 'right':
        await element.click({ button: 'right' });
        break;
      case 'single':
      default:
        await element.click();
        break;
    }

    // Get element information for output
    const elementInfo = await page.evaluate((el) => {
      if (!el) return { tagName: 'unknown', text: '', id: '', className: '' };
      return {
        tagName: el.tagName,
        text: el.textContent?.substring(0, 100) || '',
        id: el.id || '',
        className: el.className || '',
      };
    }, element);

    // Store click result in flow variables
    const additionalVariables = {
      [`${context.node.id}_clicked`]: true,
      [`${context.node.id}_element`]: elementInfo,
    };

    if (context.dispatcher) {
      context.dispatcher.updateVariables(additionalVariables);
    } else {
      Object.assign(context.flowState.variables, additionalVariables);
    }

    const resultData = {
      success: true,
      selector,
      selectorType,
      clickType,
      element: elementInfo,
      message: `Successfully clicked element: ${selector}`,
    };

    return JSON.stringify(resultData, null, 2);
  }
}

// Export singleton instance
export const webClickExecutor = new WebClickExecutor();
