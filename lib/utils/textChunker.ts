/**
 * Splits text into chunks based on separator and token limit
 */
export function chunkText(
  text: string,
  chunkSeparator: string[] = [],
  maxTokensPerChunk: number = 128
): string[] {
  chunkSeparator = chunkSeparator.length == 0 ? ["\n"] : chunkSeparator;

  const escaped = chunkSeparator.map(sep =>
    sep.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  );
  const separatorRegex = new RegExp(escaped.join('|'), 'g');




  // Split text theo separator
  const rawChunks = text.split(separatorRegex).filter(chunk => chunk.trim().length > 0);
  const resultChunks: string[] = [];
  let currentChunk = "";
  let currentTokenCount = 0;

  for (let chunk of rawChunks) {
    chunk = chunk.trim();
    if (!chunk) continue;



    currentChunk += ` ${chunk}`;
    currentTokenCount += Math.ceil(chunk.length);

    if (currentTokenCount > maxTokensPerChunk) {
      resultChunks.push(currentChunk.trim());
      currentChunk = '';
      currentTokenCount = 0;
    }
  }
  currentChunk = currentChunk.trim();
  if (currentChunk.length > 0) {
    resultChunks.push(currentChunk);
  }
  return resultChunks;
}

/**
 * Extracts metadata for a chunk
 */
export function extractChunkMetadata(chunk: string, index: number): Record<string, string | number> {
  return {
    chunkIndex: index,
    charCount: chunk.length,
    estimatedTokenCount: Math.ceil(chunk.length / 4),
    heading: chunk.split('\n')[0].substring(0, 100)
  };
}
