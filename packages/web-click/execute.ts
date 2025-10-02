import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { findNextNodes, isNodeReady, FlowStateDispatcher } from '@n2flowjs/flow';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { WebClickNodeData } from './types';
import { getCurrentPage } from '../web-open/execute';

export async function executeWebClickNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  _callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as WebClickNodeData;
  const form = data.form || {} as WebClickNodeData['form'];
  const startTime = new Date().toISOString();

  const inputs: string[] = getInputFromTemplate(form.selector || '');
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
        type: 'web-click' as any,
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
    const page = getCurrentPage();
    if (!page) {
      throw new Error('No active browser page. Please use web-open node first.');
    }

    const selector = processTemplate(form.selector || '', flowState.variables);
    const selectorType = form.selectorType || 'css';
    const clickType = form.clickType || 'single';
    const waitForSelector = form.waitForSelector ?? true;
    const timeout = form.timeout || 30000;
    const delay = form.delay || 0;

    let element;
    
    // Wait for selector based on type
    if (waitForSelector) {
      if (selectorType === 'xpath') {
        await page.waitForSelector(`::-p-xpath(${selector})`, { timeout });
        element = await page.$(`::-p-xpath(${selector})`);
      } else if (selectorType === 'text') {
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
      } else {
        // CSS selector
        await page.waitForSelector(selector, { timeout });
        element = await page.$(selector);
      }
    } else {
      // Don't wait, just try to find element
      if (selectorType === 'xpath') {
        element = await page.$(`::-p-xpath(${selector})`);
      } else if (selectorType === 'text') {
        element = await page.evaluateHandle((text: string) => {
          return Array.from(document.querySelectorAll('*')).find(
            el => el.textContent?.includes(text)
          );
        }, selector);
      } else {
        element = await page.$(selector);
      }
    }

    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Type guard to ensure we have an ElementHandle
    if (!('click' in element)) {
      throw new Error('Invalid element handle');
    }

    // Add delay before clicking if specified
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Perform click based on type
    if (clickType === 'double') {
      await element.click({ clickCount: 2 });
    } else if (clickType === 'right') {
      await element.click({ button: 'right' });
    } else {
      await element.click();
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

    const resultData = {
      success: true,
      selector,
      selectorType,
      clickType,
      element: elementInfo,
      message: `Successfully clicked element: ${selector}`,
    };

    const resultText = JSON.stringify(resultData, null, 2);

    let finalState = flowState;
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'web-click');
      dispatcher.updateVariables({
        [`${node.id}_clicked`]: true,
        [`${node.id}_element`]: elementInfo,
      });
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'web-click';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      flowState.variables[`${node.id}_clicked`] = true;
      flowState.variables[`${node.id}_element`] = elementInfo;
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
        type: 'web-click' as any,
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
    const errorMessage = `Web Click Error: ${error.message}`;
    
    let finalState = flowState;
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, errorMessage, 'web-click');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = errorMessage;
      flowState.components[node.id]['type'] = 'web-click';
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
        type: 'web-click' as any,
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
