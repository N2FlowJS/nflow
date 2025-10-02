/**
 * Template Variable Parser
 * 
 * Extracts variables from template strings for dynamic port generation.
 * Supports syntax like {variable}, {variable:type}, and nested patterns.
 * 
 * Examples:
 * - "Hello {name}" → [{ name: 'name', type: 'string' }]
 * - "Age: {age:number}" → [{ name: 'age', type: 'number' }]
 * - "Active: {active:bool}" → [{ name: 'active', type: 'boolean' }]
 */

export interface TemplateVariable {
  name: string;           // Variable name (e.g., "name")
  fullMatch: string;      // Full match (e.g., "{name}")
  position: number;       // Position in template string
  type: 'string' | 'number' | 'boolean';  // Inferred or explicit type
}

/**
 * Parse template string and extract all variables
 * 
 * Supports multiple syntaxes:
 * - {variable} - Default to string type
 * - {variable:number} or {variable:num} - Number type
 * - {variable:boolean} or {variable:bool} - Boolean type
 * - {variable:string} or {variable:str} - Explicit string type
 * 
 * @param template - Template string to parse
 * @returns Array of unique template variables
 */
export function parseTemplateVariables(template: string): TemplateVariable[] {
  if (!template || typeof template !== 'string') {
    return [];
  }

  // Regex: matches {variable} or {variable:type}
  // Supports alphanumeric variable names starting with letter or underscore
  const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)(:[a-z]+)?\}/g;
  const variables: TemplateVariable[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const name = match[1];
    const typeHint = match[2]?.slice(1); // Remove ":" prefix
    
    variables.push({
      name,
      fullMatch: match[0],
      position: match.index,
      type: inferType(typeHint),
    });
  }

  // Remove duplicates (keep first occurrence)
  const uniqueMap = new Map<string, TemplateVariable>();
  for (const variable of variables) {
    if (!uniqueMap.has(variable.name)) {
      uniqueMap.set(variable.name, variable);
    }
  }

  return Array.from(uniqueMap.values());
}

/**
 * Infer variable type from type hint or default to string
 */
function inferType(hint?: string): 'string' | 'number' | 'boolean' {
  if (!hint) return 'string';
  
  const normalized = hint.toLowerCase();
  
  // Number types
  if (normalized === 'number' || normalized === 'num' || normalized === 'int' || normalized === 'float') {
    return 'number';
  }
  
  // Boolean types
  if (normalized === 'boolean' || normalized === 'bool') {
    return 'boolean';
  }
  
  // Default to string
  return 'string';
}

/**
 * Get variable names only (simple helper)
 */
export function getVariableNames(template: string): string[] {
  const variables = parseTemplateVariables(template);
  return variables.map(v => v.name);
}

/**
 * Check if template contains any variables
 */
export function hasVariables(template: string): boolean {
  return parseTemplateVariables(template).length > 0;
}

/**
 * Replace variables in template with provided values
 * 
 * @param template - Template string with {variables}
 * @param values - Object with variable values
 * @param keepUnmatched - If true, keep unmatched variables as {var}, else remove them
 * @returns Processed template string
 */
export function replaceVariables(
  template: string,
  values: Record<string, any>,
  keepUnmatched: boolean = true
): string {
  if (!template) return '';
  
  const variables = parseTemplateVariables(template);
  let result = template;
  
  for (const variable of variables) {
    const value = values[variable.name];
    
    if (value !== undefined && value !== null) {
      // Replace all occurrences of this variable
      const regex = new RegExp(`\\{${variable.name}(:[a-z]+)?\\}`, 'g');
      result = result.replace(regex, String(value));
    } else if (!keepUnmatched) {
      // Remove unmatched variables
      const regex = new RegExp(`\\{${variable.name}(:[a-z]+)?\\}`, 'g');
      result = result.replace(regex, '');
    }
  }
  
  return result;
}

/**
 * Validate template syntax (check for mismatched braces, etc.)
 */
export function validateTemplate(template: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!template) {
    return { valid: true, errors: [] };
  }
  
  // Check for unmatched opening braces
  const openBraces = (template.match(/\{/g) || []).length;
  const closeBraces = (template.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    errors.push(`Unmatched braces: ${openBraces} opening, ${closeBraces} closing`);
  }
  
  // Check for nested braces (not supported)
  if (/\{\{|\}\}/.test(template)) {
    errors.push('Nested braces are not supported');
  }
  
  // Check for invalid variable names
  const invalidVars = template.match(/\{[^a-zA-Z_][^}]*\}/g);
  if (invalidVars) {
    errors.push(`Invalid variable names: ${invalidVars.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
