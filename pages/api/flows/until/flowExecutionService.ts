import { Flow } from '../../../../components/agent/types/flowTypes';
import { OpenAIExecutionResult } from '../type';

/**
 * Utility functions for flow execution
 */
/**
 * Find the next node in the flow
 */
export const findNextNode = (flow: Flow, currentNodeId: string, edgeSelector?: string): string | null => {
  // Find edges that start from the current node
  const edges = flow.edges.filter((edge) => edge.source === currentNodeId);

  if (edges.length === 0) {
    return null;
  }

  // If an edge selector is provided (e.g., a category name for categorize nodes)
  if (edgeSelector) {
    const edge = edges.find((e) => e.sourceHandle === `out-${edgeSelector}`);
    return edge ? edge.target : null;
  }

  // Otherwise, just take the first edge
  return edges[0].target;
};

/**
 * Process a stream of SSE events from the API
 * Returns a processed stream that emits complete objects for each event
 */
export function processEventStream(stream: ReadableStream<Uint8Array>): ReadableStream<OpenAIExecutionResult> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
  
    return new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              if (buffer.length > 0) {
                try {
                  const event = parseEvent(buffer);
                  if (event) {
                    controller.enqueue(event);
                  }
                } catch (e) {
                  console.error('Error parsing final event', e);
                }
              }
              controller.close();
              return;
            }
  
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete events in buffer
            const events = buffer.split('\n\n');
            buffer = events.pop() || '';
  
            for (const eventText of events) {
              if (eventText.trim()) {
                try {
                  const event = parseEvent(eventText);
                  if (event) {
                    controller.enqueue(event);
                  }
                } catch (e) {
                  console.error('Error parsing event', e);
                }
              }
            }
            
            push();
          }).catch(err => {
            console.error('Stream reading error:', err);
            controller.error(err);
          });
        }
        
        push();
      }
    });
  }
  
  /**
   * Parse an SSE event into a structured object
   */
  function parseEvent(eventText: string): OpenAIExecutionResult | null {
    const lines = eventText.split('\n');
    let data = '';
    let event = '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        data += line.slice(6);
      } else if (line.startsWith('event: ')) {
        event = line.slice(7);
      }
    }
    
    if (data === '[DONE]') {
      return {
        status: 'completed',
        message: 'Stream finished',
      };
    }
    
    if (!data) return null;
    
    try {
      const parsedData = JSON.parse(data);
      
      // Extract only the core execution result without client state fields
      // This ensures we don't leak state data through the OpenAIExecutionResult
      const { clientState, nodeInfo, executionStatus, ...coreResult } = parsedData;
      
      // Only pass through the conversationId if available
      if (parsedData.conversationId) {
        coreResult.conversationId = parsedData.conversationId;
      }
      
      return coreResult;
    } catch (e) {
      console.error('Error parsing event data:', e);
      return {
        status: 'error',
        message: `Failed to parse stream data: ${data}`
      };
    }
  }

