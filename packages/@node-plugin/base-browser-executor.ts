import { BaseNodeExecutor, ExecutorConfig } from '../@node-plugin/base-executor';
import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * Base Browser Executor
 * 
 * Extends BaseNodeExecutor with browser automation capabilities.
 * Provides common browser instance management, page operations, and error handling.
 */
export abstract class BaseBrowserExecutor<TForm> extends BaseNodeExecutor<TForm> {
  // Global browser instance cache for reuse
  private static globalBrowser: Browser | null = null;
  private static globalPage: Page | null = null;

  constructor(config: ExecutorConfig) {
    super(config);
  }

  /**
   * Get or create browser instance
   */
  protected async getBrowserInstance(headless: boolean = true): Promise<Browser> {
    if (!BaseBrowserExecutor.globalBrowser || !BaseBrowserExecutor.globalBrowser.isConnected()) {
      BaseBrowserExecutor.globalBrowser = await puppeteer.launch({
        headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return BaseBrowserExecutor.globalBrowser;
  }

  /**
   * Get current page instance
   */
  protected getCurrentPage(): Page | null {
    return BaseBrowserExecutor.globalPage;
  }

  /**
   * Create or reset page instance
   */
  protected async getOrCreatePage(browser?: Browser): Promise<Page> {
    // Close existing page if open
    if (BaseBrowserExecutor.globalPage && !BaseBrowserExecutor.globalPage.isClosed()) {
      await BaseBrowserExecutor.globalPage.close();
    }

    // Use provided browser or get global instance
    const browserInstance = browser || await this.getBrowserInstance();
    BaseBrowserExecutor.globalPage = await browserInstance.newPage();
    
    return BaseBrowserExecutor.globalPage;
  }

  /**
   * Set page instance (for external management)
   */
  protected setCurrentPage(page: Page): void {
    BaseBrowserExecutor.globalPage = page;
  }

  /**
   * Wait for and get element by selector with type support
   */
  protected async waitAndGetElement(
    page: Page,
    selector: string,
    selectorType: 'css' | 'xpath' | 'text',
    options: {
      waitForSelector?: boolean;
      timeout?: number;
    } = {}
  ): Promise<any> {
    const { waitForSelector = true, timeout = 30000 } = options;

    let element;

    if (waitForSelector) {
      switch (selectorType) {
        case 'xpath':
          await page.waitForSelector(`::-p-xpath(${selector})`, { timeout });
          element = await page.$(`::-p-xpath(${selector})`);
          break;

        case 'text':
          // Wait for element containing text
          await page.waitForFunction(
            (text: string) => {
              return Array.from(document.querySelectorAll('*')).some(
                el => el.textContent?.includes(text)
              );
            },
            { timeout },
            selector
          );
          element = await page.evaluateHandle((text: string) => {
            return Array.from(document.querySelectorAll('*')).find(
              el => el.textContent?.includes(text)
            );
          }, selector);
          break;

        case 'css':
        default:
          await page.waitForSelector(selector, { timeout });
          element = await page.$(selector);
          break;
      }
    } else {
      // Don't wait, just try to find element
      switch (selectorType) {
        case 'xpath':
          element = await page.$(`::-p-xpath(${selector})`);
          break;

        case 'text':
          element = await page.evaluateHandle((text: string) => {
            return Array.from(document.querySelectorAll('*')).find(
              el => el.textContent?.includes(text)
            );
          }, selector);
          break;

        case 'css':
        default:
          element = await page.$(selector);
          break;
      }
    }

    if (!element) {
      throw new Error(`Element not found: ${selector} (type: ${selectorType})`);
    }

    return element;
  }

  /**
   * Ensure page is available
   */
  protected ensurePageAvailable(): Page {
    const page = this.getCurrentPage();
    if (!page) {
      throw new Error('No active browser page. Please use web-open node first.');
    }
    return page;
  }

  /**
   * Close browser and page
   */
  static async closeBrowser(): Promise<void> {
    if (BaseBrowserExecutor.globalPage && !BaseBrowserExecutor.globalPage.isClosed()) {
      await BaseBrowserExecutor.globalPage.close();
      BaseBrowserExecutor.globalPage = null;
    }
    if (BaseBrowserExecutor.globalBrowser && BaseBrowserExecutor.globalBrowser.isConnected()) {
      await BaseBrowserExecutor.globalBrowser.close();
      BaseBrowserExecutor.globalBrowser = null;
    }
  }

}

/**
 * Export cleanup function for external use
 */
export async function closeWebBrowser(): Promise<void> {
  await BaseBrowserExecutor.closeBrowser();
}

/**
 * Export function to get current page for cross-node communication
 */
export function getCurrentPage(): Page | null {
  return (BaseBrowserExecutor as any).globalPage;
}
