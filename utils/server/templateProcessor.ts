/**
 * Simplified template processor
 */
export function processTemplate(template: string, variables: Record<string, any>): string {
  if (!template) return '';
  
  // Single pass replacement for both {{var}} and $var formats
  return template.replace(/(\{\{([^}]+)\}\})|(\$([a-zA-Z0-9_]+))/g, (match, _m1, varName1, _m3, varName2) => {
    // Extract variable name (from either format)
    const name = (varName1 || varName2).trim();
    
    // Return value if exists, empty string if null/undefined, or original match if not found
    return variables.hasOwnProperty(name)
      ? (variables[name] != null ? String(variables[name]) : '')
      : match;
  });
}
