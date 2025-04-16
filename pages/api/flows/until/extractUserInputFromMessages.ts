// Function to extract user input from OpenAI messages format
export function extractUserInputFromMessages(messages?: Array<{ role: string; content: string }>): string | undefined {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return undefined;
  }

  const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user');
  return lastUserMessage?.content;
}
