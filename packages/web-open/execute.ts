import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { findNextNodes, isNodeReady, FlowStateDispatcher } from '@n2flowjs/flow';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { WebOpenNodeData } from './types';
import puppeteer, { Browser, Page } from 'puppeteer';

// Global browser instance cache to reuse across multiple operations
let globalBrowser: Browser | null = null;
let globalPage: Page | null = null;

async function getBrowserInstance(headless: boolean = true): Promise<Browser> {
  if (!globalBrowser || !globalBrowser.isConnected()) {
    globalBrowser = await puppeteer.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return globalBrowser;
}

export async function executeWebOpenNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  _callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as WebOpenNodeData;
  const form = data.form || {} as WebOpenNodeData['form'];
  const startTime = new Date().toISOString();

  const inputs: string[] = getInputFromTemplate(form.url || '');
  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'web-open' as any,
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime,
        endTime: new Date().toISOString(),
        output: 'Waiting for input variables',
      },
    };
  }

  try {
    const url = processTemplate(form.url || '', flowState.variables);
    const headless = form.headless ?? true;
    const viewport = form.viewport || { width: 1920, height: 1080 };
    const timeout = form.timeout || 30000;
    const waitUntil = form.waitUntil || 'networkidle2';

    // Get or create browser instance
    const browser = await getBrowserInstance(headless);
    
    // Create new page or reuse existing
    if (globalPage && !globalPage.isClosed()) {
      await globalPage.close();
    }
    globalPage = await browser.newPage();

    // Set viewport
    await globalPage.setViewport(viewport);

    // Set user agent if provided
    if (form.userAgent) {
      await globalPage.setUserAgent(processTemplate(form.userAgent, flowState.variables));
    }

    // Navigate to URL
    await globalPage.goto(url, { 
      waitUntil,
      timeout,
    });

    // Get page information
    const pageTitle = await globalPage.title();
    const pageUrl = globalPage.url();
    
    const resultData = {
      success: true,
      url: pageUrl,
      title: pageTitle,
      browserId: 'global-browser',
      pageId: 'global-page',
      message: `Successfully opened ${pageUrl}`,
    };

    const resultText = JSON.stringify(resultData, null, 2);

    let finalState = flowState;
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'web-open');
      dispatcher.updateVariables({
        [`${node.id}_url`]: pageUrl,
        [`${node.id}_title`]: pageTitle,
        [`${node.id}_browser`]: 'global-browser',
        [`${node.id}_page`]: 'global-page',
      });
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'web-open';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      flowState.variables[`${node.id}_url`] = pageUrl;
      flowState.variables[`${node.id}_title`] = pageTitle;
      flowState.variables[`${node.id}_browser`] = 'global-browser';
      flowState.variables[`${node.id}_page`] = 'global-page';
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);
    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'web-open' as any,
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: any) {
    const errorMessage = `Web Open Error: ${error.message}`;
    
    let finalState = flowState;
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, errorMessage, 'web-open');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = errorMessage;
      flowState.components[node.id]['type'] = 'web-open';
      flowState.currentNode = node;
      finalState = flowState;
    }

    return {
      status: 'error',
      nextNodes: [],
      flowState: finalState,
      message: errorMessage,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'web-open' as any,
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime,
        endTime: new Date().toISOString(),
        output: errorMessage,
      },
    };
  }
}

// Export cleanup function
export async function closeWebBrowser(): Promise<void> {
  if (globalPage && !globalPage.isClosed()) {
    await globalPage.close();
    globalPage = null;
  }
  if (globalBrowser && globalBrowser.isConnected()) {
    await globalBrowser.close();
    globalBrowser = null;
  }
}

// Export function to get current page
export function getCurrentPage(): Page | null {
  return globalPage;
}
