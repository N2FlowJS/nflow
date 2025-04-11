/**
 * Splits text into chunks based on separator and token limit
 */
export function chunkText(
  text: string,
  chunkSeparator: string = "\n\r",
  maxTokensPerChunk: number = 1000
): string[] {
  // Create a regular expression that matches any character in the chunkSeparator
  const separatorRegex = new RegExp(`[${chunkSeparator.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
  
  // Split by any character in the separator
  const rawChunks = text.split(separatorRegex).filter(chunk => chunk.trim().length > 0);
  const resultChunks: string[] = [];
  let currentChunk = "";
  let currentTokenCount = 0;

  // Process each chunk
  for (const chunk of rawChunks) {
    // Estimate token count (rough approximation: 4 chars ~ 1 token)
    const estimatedTokens = Math.ceil(chunk.length / 4);
    
    // If adding this chunk would exceed the limit, save current chunk and start a new one
    if (currentTokenCount + estimatedTokens > maxTokensPerChunk && currentChunk.length > 0) {
      resultChunks.push(currentChunk);
      currentChunk = chunk;
      currentTokenCount = estimatedTokens;
    } 
    // Start accumulating
    else {
      currentChunk = currentChunk.length > 0 
        ? `${currentChunk}${chunkSeparator[0]}${chunk}` // Use first character of separator when rejoining
        : chunk;
      currentTokenCount += estimatedTokens;
    }
  }

  // Add the last chunk if not empty
  if (currentChunk.length > 0) {
    resultChunks.push(currentChunk);
  }

  return resultChunks;
}

/**
 * Extracts metadata for a chunk
 */
export function extractChunkMetadata(chunk: string, index: number): Record<string, any> {
  return {
    chunkIndex: index,
    charCount: chunk.length,
    estimatedTokenCount: Math.ceil(chunk.length / 4),
    // Extract a brief heading/title from the first line
    heading: chunk.split('\n')[0].substring(0, 100)
  };
}
