import { BaseBrowserExecutor } from '../@node-plugin/base-browser-executor';
import { ExecutionContext } from '../@node-plugin/base-executor';
import { WebOpenForm } from './types';

/**
 * Web Open Node Executor
 * 
 * Opens a browser and navigates to a specified URL.
 * Manages browser instance and page lifecycle.
 */
export class WebOpenExecutor extends BaseBrowserExecutor<WebOpenForm> {
  constructor() {
    super({
      nodeType: 'web-open',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['url', 'userAgent'],
    });
  }

  /**
   * Execute web open logic - navigate to URL
   */
  protected async executeLogic(
    form: WebOpenForm,
    context: ExecutionContext
  ): Promise<string> {
    // Process template fields
    const url = this.processTemplate(form.url, context);
    const headless = form.headless ?? true;
    const viewport = form.viewport || { width: 1920, height: 1080 };
    const timeout = form.timeout || 30000;
    const waitUntil = form.waitUntil || 'networkidle2';

    // Get or create browser instance
    const browser = await this.getBrowserInstance(headless);
    
    // Create new page
    const page = await this.getOrCreatePage(browser);

    // Set viewport
    await page.setViewport(viewport);

    // Set user agent if provided
    if (form.userAgent) {
      const userAgent = this.processTemplate(form.userAgent, context);
      await page.setUserAgent(userAgent);
    }

    // Navigate to URL
    await page.goto(url, { 
      waitUntil,
      timeout,
    });

    // Get page information
    const pageTitle = await page.title();
    const pageUrl = page.url();
    
    // Create result data
    const resultData = {
      success: true,
      url: pageUrl,
      title: pageTitle,
      browserId: 'global-browser',
      pageId: 'global-page',
      message: `Successfully opened ${pageUrl}`,
    };

    // Store page info in flow variables for other nodes
    const additionalVariables = {
      [`${context.node.id}_url`]: pageUrl,
      [`${context.node.id}_title`]: pageTitle,
      [`${context.node.id}_browser`]: 'global-browser',
      [`${context.node.id}_page`]: 'global-page',
    };

    // Update state with additional variables
    if (context.dispatcher) {
      context.dispatcher.updateVariables(additionalVariables);
    } else {
      Object.assign(context.flowState.variables, additionalVariables);
    }

    return JSON.stringify(resultData, null, 2);
  }
}

// Export singleton instance
export const webOpenExecutor = new WebOpenExecutor();
