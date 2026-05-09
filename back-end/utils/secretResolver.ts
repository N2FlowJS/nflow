/**
 * Resolves secret placeholders in node configurations.
 * Placeholders are in the format {{SECRET_NAME}}.
 * Values are resolved from server-side environment variables.
 */
export const resolveSecrets = (data: Record<string, any>): Record<string, any> => {
  if (!data) return data;
  
  const resolved = { ...data };
  
  // Recursively resolve secrets in nested objects if needed, 
  // but for now, simple top-level resolution is sufficient for node params.
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === 'string') {
      // Direct match: {{MY_SECRET}}
      if (value.startsWith('{{') && value.endsWith('}}')) {
        const secretName = value.slice(2, -2).trim();
        const envValue = process.env[secretName];
        if (envValue !== undefined) {
          resolved[key] = envValue;
        }
      } else if (value.includes('{{')) {
        // Partial match: "Bearer {{MY_TOKEN}}"
        resolved[key] = value.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_match, rawName) => {
          const name = String(rawName).trim();
          return process.env[name] || _match;
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      resolved[key] = resolveSecrets(value as Record<string, any>);
    }
  }
  
  return resolved;
};
