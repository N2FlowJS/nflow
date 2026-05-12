/**
 * Resolves secret placeholders in node configurations.
 * Placeholders are in the format {{SECRET_NAME}}.
 * Values are resolved from server-side environment variables.
 */
export const resolveSecrets = (data: Record<string, any>): Record<string, any> => {
  if (!data) return data;

  const resolved = { ...data };
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === 'string' && value.includes('{{')) {
      resolved[key] = value.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_m, rawName) =>
        process.env[String(rawName).trim()] ?? _m
      );
    } else if (typeof value === 'object' && value !== null) {
      resolved[key] = resolveSecrets(value as Record<string, any>);
    }
  }
  return resolved;
};

export const resolveSecretString = (value: string): string =>
  value.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (m, n) => process.env[String(n).trim()] ?? m);
