import { Utils } from "@n2flow/types";

/** Convert an internal component type name to a human-readable label.
 *  e.g. "ChatModelComponent" → "Chat Model"
 */
export const prettifyLabel = Utils.prettifyLabel;

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
  const message = Utils.toErrorMessage(error);
  return message
    .replace(/^Node\s*\[[^\]]+\]\s*failed:\s*/i, '')
    .replace(/^Error:\s*/i, '')
    .trim();
}

export function maskSecretValue(v: string | unknown): string {
  const s = String(v || '').trim();
  if (!s) return '[empty]';
  return Utils.maskString(s);
}

export function looksLikeSecret(v: string | unknown): boolean {
  return Utils.looksLikeSecret(v);
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
