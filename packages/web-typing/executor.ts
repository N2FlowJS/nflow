import { BaseBrowserExecutor } from '../@node-plugin/base-browser-executor';
import { ExecutionContext } from '../@node-plugin/base-executor';
import { WebTypingForm } from './types';

/**
 * Web Typing Node Executor
 * 
 * Types text into input fields or textareas on a web page.
 */
export class WebTypingExecutor extends BaseBrowserExecutor<WebTypingForm> {
  constructor() {
    super({
      nodeType: 'web-typing',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['selector', 'text'],
    });
  }

  /**
   * Execute web typing logic - find element and type text
   */
  protected async executeLogic(
    form: WebTypingForm,
    context: ExecutionContext
  ): Promise<string> {
    // Ensure page is available
    const page = this.ensurePageAvailable();

    // Process template fields
    const selector = this.processTemplate(form.selector, context);
    const text = this.processTemplate(form.text, context);
    const selectorType = form.selectorType || 'css';
    const clearBefore = form.clearBefore ?? true;
    const pressEnter = form.pressEnter ?? false;
    const typingDelay = form.typingDelay || 50;
    const waitForSelector = form.waitForSelector ?? true;
    const timeout = form.timeout || 30000;

    // Wait for and get element
    const element = await this.waitAndGetElement(page, selector, selectorType, {
      waitForSelector,
      timeout,
    });

    // Type guard to ensure we have an ElementHandle with type method
    if (!('click' in element) || !('type' in element)) {
      throw new Error('Invalid element handle - element must support typing');
    }

    // Focus on the element
    await element.click();

    // Clear existing content if requested
    if (clearBefore) {
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
    }

    // Type the text with specified delay
    await element.type(text, { delay: typingDelay });

    // Press Enter if requested
    if (pressEnter) {
      await page.keyboard.press('Enter');
    }

    // Get element information for output
    const elementInfo = await page.evaluate((el) => {
      if (!el) return { tagName: 'unknown', value: '', id: '', name: '' };
      const input = el as HTMLInputElement | HTMLTextAreaElement;
      return {
        tagName: el.tagName,
        value: input.value?.substring(0, 100) || '',
        id: el.id || '',
        name: input.name || '',
      };
    }, element);

    // Store typing result in flow variables
    const additionalVariables = {
      [`${context.node.id}_typed`]: true,
      [`${context.node.id}_text`]: text,
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
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      textLength: text.length,
      element: elementInfo,
      pressedEnter: pressEnter,
      message: `Successfully typed ${text.length} characters into element: ${selector}`,
    };

    return JSON.stringify(resultData, null, 2);
  }
}

// Export singleton instance
export const webTypingExecutor = new WebTypingExecutor();
