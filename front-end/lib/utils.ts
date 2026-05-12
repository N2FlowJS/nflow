/** Convert an internal component type name to a human-readable label.
 *  e.g. "ChatModelComponent" → "Chat Model"
 */
export function prettifyLabel(typeName: string): string {
  const withoutComp = typeName.replace(/Component$/, '').replace(/_/g, ' ');
  const spaced = withoutComp.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced.replace(/\b([a-z])/g, (s) => s.toUpperCase());
}

/** Safely convert any value to a string. */
export function stringifyUnknown(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Extract a clean, human-readable error message from any error value.
 *  Strips "Node [x] failed:" prefixes and unwraps embedded JSON `{"error": ...}` payloads.
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) return '';
  const compact = stringifyUnknown(error)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^Node\s*\[[^\]]+\]\s*failed:\s*/i, '')
    .replace(/^Error:\s*/i, '');
  const jsonStart = compact.indexOf('{"error"');
  if (jsonStart >= 0) {
    try {
      const payload = JSON.parse(compact.slice(jsonStart)) as { error?: { message?: unknown } };
      const message = payload.error?.message;
      if (typeof message === 'string' && message.trim()) return message.trim();
    } catch { /* fall through */ }
  }
  return compact;
}

export function maskSecretValue(v: string | unknown): string {
  const s = String(v || '').trim();
  if (!s) return '[empty]';
  return s.length <= 8 ? `${s.slice(0, 2)}***` : `${s.slice(0, 4)}***${s.slice(-4)}`;
}

export function looksLikeSecret(v: string | unknown): boolean {
  const s = String(v || '').trim();
  if (!s) return false;
  const isKey = /^(?:Bearer\s+)?(?:nvapi-|sk-|pk-|ghp_|glpat-|AIza|xoxb-|ya29\.)/i.test(s);
  return isKey || s.length >= 32;
}

/**
 * Summarizes the output of a node for display.
 */
export function getOutputSummary(output: unknown): string {
  if (typeof output === 'string') {
    return `${output.slice(0, 80)}${output.length > 80 ? '...' : ''}`;
  }

  if (output === undefined || output === null) {
    return 'No result';
  }

  return 'Result available';
}
