/**
 * Simplified template processor
 */
export function processTemplate(template: string, variables: Record<string, any>): string {
  // example template: "Hello {{name}}! Your ID is {{id}}."
  if (!template) return '';

  // Single pass replacement for both {{var}} and $var formats
  return template.replace(/(\{\{([^}]+)\}\})/g, (match, _m1, varName1, _m3, varName2) => {
    // Extract variable name (from either format)
    const name = (varName1 || varName2).trim();

    // Return value if exists, empty string if null/undefined, or original match if not found
    return variables.hasOwnProperty(name)
      ? (variables[name] != null ? String(variables[name]) : '')
      : match;
  });
}
export function getInputFromTemplate(template: string): string[] {
  // example template: "Hello {{name}}! Your ID is {{id}}."
  if (!template) return [];

  // Extract variable names from the template
  const matches = template.match(/(\{\{([^}]+)\}\})/g);

  if (!matches) return [];

  // Replace variable names with their values from the variables object
  const inputs = matches.map((match) => {
    const varName = match.replace(/(\{\{|\}\})/g, '').trim();
    return varName;
  }).filter((varName) => varName !== '');

  return inputs;
}