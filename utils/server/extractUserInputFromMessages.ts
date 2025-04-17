/**
 * Extract the most recent user input from an array of messages
 * in OpenAI-compatible format
 * 
 * @param messages Array of message objects with role and content
 * @returns The content of the latest user message, or null if none found
 */
export function extractUserInputFromMessages(messages: Array<{ role: string; content: string }> = []): string | null {
  // Find all user messages
  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .filter(msg => typeof msg.content === 'string' && msg.content.trim() !== '');
  
  // Return the last user message content if it exists
  return userMessages.length > 0 
    ? userMessages[userMessages.length - 1].content 
    : null;
}
