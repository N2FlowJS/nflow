import { OpenAIExecutionResult } from '../types/flow';

/**
 * Process a server-sent event stream into a structured ReadableStream
 * 
 * @param stream The ReadableStream from fetch
 * @returns A new ReadableStream with parsed JSON objects
 */
export function processEventStream(stream: ReadableStream<Uint8Array>): ReadableStream<any> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Process any remaining data when the stream is done
            if (buffer.trim()) {
              const lastChunk = processChunk(buffer);
              if (lastChunk) {
                controller.enqueue(lastChunk);
              }
            }
            controller.close();
            return;
          }

          // Decode and add to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete events (separated by double newlines)
          const events = buffer.split(/\r\n\r\n|\n\n/);
          
          // Keep the last part in the buffer if it's incomplete
          buffer = events.pop() || '';
          
          // Process and enqueue each complete event
          for (const event of events) {
            if (event.trim()) {
              const chunk = processChunk(event);
              if (chunk) {
                controller.enqueue(chunk);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing event stream:', error);
        controller.error(error);
      }
    },
    
    async cancel() {
      await reader.cancel();
    }
  });
}

/**
 * Process an individual SSE chunk into a structured object
 */
function processChunk(chunk: string): any | null {
  // Skip empty chunks
  if (!chunk.trim()) return null;
  
  // Parse data lines
  const lines = chunk.split(/\r\n|\n/);
  const dataLines = lines
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trim());
  
  if (dataLines.length === 0) return null;
  
  // Join data lines and parse JSON
  const data = dataLines.join('');
  
  // Handle special "[DONE]" marker
  if (data === '[DONE]') {
    return { done: true };
  }
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing JSON from event stream:', error, data);
    return { error: 'Invalid JSON', data };
  }
}
