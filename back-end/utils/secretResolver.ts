/**
 * Resolves secret placeholders in node configurations.
 * Placeholders are in the format {{SECRET_NAME}}.
 * Values are resolved from server-side environment variables.
 */
export const resolveSecretString = (v: string): string =>
  v.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (m, n) => process.env[String(n).trim()] ?? m);

/**
 * Resolves secret placeholders in node configurations.
 * Placeholders are in the format {{SECRET_NAME}}.
 */
export const resolveSecrets = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(resolveSecrets);

  const resolved: Record<string, any> = { ...data };
  for (const [key, val] of Object.entries(resolved)) {
    if (typeof val === 'string' && val.includes('{{')) {
      resolved[key] = resolveSecretString(val);
    } else {
      resolved[key] = resolveSecrets(val);
    }
  }
  return resolved;
};
