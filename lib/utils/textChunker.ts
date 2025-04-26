/**
 * Splits text into chunks based on separator and token limit
 */
export function chunkText(
  text: string,
  chunkSeparator: string[] | string = ["\n"],
  maxTokensPerChunk: number = 128
): string[] {
  let separators: string[] = [];
  if (Array.isArray(chunkSeparator)) {
    separators = chunkSeparator;
  } else if (typeof chunkSeparator === "string") {
    separators = [chunkSeparator];
  } else {
    separators = ["\n"];
  }

  if (separators.length === 0) {
    separators = ["\n"];
  }

  const escaped = separators.map(sep =>
    sep.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  );
  const separatorRegex = new RegExp(escaped.join('|'), 'g');
  console.log("Separator regex:", separatorRegex);


  // Split text theo separator
  const rawChunks = text.split(separatorRegex).filter(chunk => chunk.trim().length > 0);
  const resultChunks: string[] = [];
  let currentChunk = "";
  let currentTokenCount = 0;

  for (let chunk of rawChunks) {
    chunk = chunk.trim();
    if (!chunk) continue; // Skip empty chunks
    const estimatedTokens = Math.ceil(chunk.length);

    if (currentTokenCount + estimatedTokens > maxTokensPerChunk) {
      resultChunks.push(currentChunk);
      currentChunk = chunk;
      currentTokenCount = estimatedTokens;
    } else {
      currentChunk = currentChunk.length > 0
        ? `${currentChunk} `
        : chunk;
      currentTokenCount += estimatedTokens;
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
    // Extract a brief heading/title from the first line
    heading: chunk.split('\n')[0].substring(0, 100)
  };
}
