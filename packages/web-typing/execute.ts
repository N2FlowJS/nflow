import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { findNextNodes, isNodeReady, FlowStateDispatcher } from '@n2flowjs/flow';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { WebTypingNodeData } from './types';
import { getCurrentPage } from '../web-open/execute';

export async function executeWebTypingNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  _callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as WebTypingNodeData;
  const form = data.form || {} as WebTypingNodeData['form'];
  const startTime = new Date().toISOString();

  const inputs: string[] = [
    ...getInputFromTemplate(form.selector || ''),
    ...getInputFromTemplate(form.text || ''),
  ];
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
        type: 'web-typing' as any,
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
    const text = processTemplate(form.text || '', flowState.variables);
    const selectorType = form.selectorType || 'css';
    const clearBefore = form.clearBefore ?? true;
    const pressEnter = form.pressEnter ?? false;
    const typingDelay = form.typingDelay || 50;
    const waitForSelector = form.waitForSelector ?? true;
    const timeout = form.timeout || 30000;

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
            return Array.from(document.querySelectorAll('input,textarea')).some(
              (el) => {
                const input = el as HTMLInputElement | HTMLTextAreaElement;
                return input.placeholder?.includes(text) || el.getAttribute('aria-label')?.includes(text);
              }
            );
          },
          { timeout },
          selector
        );
        element = await page.evaluateHandle((text: string) => {
          return Array.from(document.querySelectorAll('input,textarea')).find(
            (el) => {
              const input = el as HTMLInputElement | HTMLTextAreaElement;
              return input.placeholder?.includes(text) || el.getAttribute('aria-label')?.includes(text);
            }
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
          return Array.from(document.querySelectorAll('input,textarea')).find(
            (el) => {
              const input = el as HTMLInputElement | HTMLTextAreaElement;
              return input.placeholder?.includes(text) || el.getAttribute('aria-label')?.includes(text);
            }
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
    if (!('click' in element) || !('type' in element)) {
      throw new Error('Invalid element handle');
    }

    // Click to focus the element
    await element.click();

    // Clear existing text if requested
    if (clearBefore) {
      await page.evaluate((el) => {
        if (el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
          el.value = '';
        }
      }, element);
    }

    // Type text with delay
    await element.type(text, { delay: typingDelay });

    // Press Enter if requested
    if (pressEnter) {
      await page.keyboard.press('Enter');
    }

    // Get element information for output
    const elementInfo = await page.evaluate((el) => {
      if (!el) return { tagName: 'unknown', value: '', id: '', className: '', placeholder: '' };
      return {
        tagName: el.tagName,
        value: (el as HTMLInputElement).value || '',
        id: el.id || '',
        className: el.className || '',
        placeholder: (el as HTMLInputElement).placeholder || '',
      };
    }, element);

    const resultData = {
      success: true,
      selector,
      selectorType,
      text: text.length > 50 ? text.substring(0, 50) + '...' : text,
      textLength: text.length,
      element: elementInfo,
      message: `Successfully typed ${text.length} characters into: ${selector}`,
    };

    const resultText = JSON.stringify(resultData, null, 2);

    let finalState = flowState;
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'web-typing');
      dispatcher.updateVariables({
        [`${node.id}_typed`]: true,
        [`${node.id}_text`]: text,
        [`${node.id}_element`]: elementInfo,
      });
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'web-typing';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      flowState.variables[`${node.id}_typed`] = true;
      flowState.variables[`${node.id}_text`] = text;
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
        type: 'web-typing' as any,
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
    const errorMessage = `Web Typing Error: ${error.message}`;
    
    let finalState = flowState;
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, errorMessage, 'web-typing');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = errorMessage;
      flowState.components[node.id]['type'] = 'web-typing';
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
        type: 'web-typing' as any,
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
