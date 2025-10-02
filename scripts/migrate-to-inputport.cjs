#!/usr/bin/env node
/**
 * Migration script: Convert NodeDefinition.config to InputPort-based configuration
 * 
 * Usage: node scripts/migrate-to-inputport.cjs <package-name>
 * Or: node scripts/migrate-to-inputport.cjs --all
 */

const fs = require('fs');
const path = require('path');

// Property type mapping
function mapPropertyTypeToPortType(property) {
  if (property.type === 'number' || property.type === 'integer') {
    return 'PortType.NUMBER';
  }
  if (property.type === 'boolean') {
    return 'PortType.BOOLEAN';
  }
  if (property.type === 'array') {
    return 'PortType.ARRAY';
  }
  if (property.type === 'object') {
    return 'PortType.JSON';
  }
  return 'PortType.TEXT';
}

// Convert config property to InputPort
function convertPropertyToInputPort(name, property, indent = '    ') {
  const lines = [];
  
  lines.push(`${indent}{`);
  lines.push(`${indent}  id: '${name}',`);
  lines.push(`${indent}  name: '${property.title || name}',`);
  lines.push(`${indent}  type: ${mapPropertyTypeToPortType(property)},`);
  
  if (property.description) {
    lines.push(`${indent}  description: '${property.description.replace(/'/g, "\\'")}',`);
  }
  
  if (property.default !== undefined) {
    const defaultValue = typeof property.default === 'string' 
      ? `'${property.default}'` 
      : JSON.stringify(property.default);
    lines.push(`${indent}  defaultValue: ${defaultValue},`);
  }
  
  const required = property.required !== false;
  lines.push(`${indent}  required: ${required},`);
  
  // Add metadata
  const metadata = [];
  
  // Input type
  if (property.enum) {
    metadata.push(`${indent}    inputType: 'select',`);
    metadata.push(`${indent}    options: ${JSON.stringify(property.enum)},`);
  } else if (property.format === 'textarea' || property.multiline) {
    metadata.push(`${indent}    inputType: 'textarea',`);
    if (property.rows) {
      metadata.push(`${indent}    rows: ${property.rows},`);
    }
  } else if (property.type === 'number' || property.type === 'integer') {
    metadata.push(`${indent}    inputType: 'number',`);
  } else {
    metadata.push(`${indent}    inputType: 'text',`);
  }
  
  // Placeholder
  if (property.placeholder) {
    metadata.push(`${indent}    placeholder: '${property.placeholder.replace(/'/g, "\\'")}',`);
  }
  
  // Number constraints
  if (property.minimum !== undefined) {
    metadata.push(`${indent}    min: ${property.minimum},`);
  }
  if (property.maximum !== undefined) {
    metadata.push(`${indent}    max: ${property.maximum},`);
  }
  if (property.step !== undefined) {
    metadata.push(`${indent}    step: ${property.step},`);
  }
  
  if (metadata.length > 0) {
    lines.push(`${indent}  metadata: {`);
    lines.push(...metadata);
    lines.push(`${indent}  },`);
  }
  
  lines.push(`${indent}},`);
  
  return lines.join('\n');
}

// Process a single definition file
function processDefinitionFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already migrated
  if (!content.includes('config:') && !content.includes('configSchema:')) {
    console.log(`  ✓ Already migrated (no config found)`);
    return;
  }
  
  // Extract config object
  const configMatch = content.match(/config:\s*\{[\s\S]*?properties:\s*\{([\s\S]*?)\n\s*\},?[\s\S]*?\n\s*\},?/);
  
  if (!configMatch) {
    console.log(`  ✗ Could not parse config object`);
    return;
  }
  
  console.log(`  → Found config, converting to InputPort...`);
  
  // For now, just notify - manual conversion recommended
  console.log(`  ⚠ Manual migration required for: ${path.basename(path.dirname(filePath))}`);
  console.log(`     Please update definition.ts to use InputPort pattern`);
  console.log(`     See packages/promt/definition.ts for reference`);
}

// Main execution
const args = process.argv.slice(2);
const root = process.cwd();
const packagesDir = path.join(root, 'packages');

if (args.includes('--all')) {
  // Process all packages
  const packages = fs.readdirSync(packagesDir)
    .filter(name => {
      const defPath = path.join(packagesDir, name, 'definition.ts');
      return fs.existsSync(defPath);
    });
  
  console.log(`Found ${packages.length} packages with definition.ts\n`);
  
  packages.forEach(pkg => {
    const defPath = path.join(packagesDir, pkg, 'definition.ts');
    processDefinitionFile(defPath);
  });
  
  console.log(`\n✓ Scan complete`);
  console.log(`\nNOTE: Automatic migration is complex due to TypeScript parsing.`);
  console.log(`Please manually migrate packages using this pattern:`);
  console.log(`  - Replace config.properties with inputs array`);
  console.log(`  - Add metadata.inputType for form rendering`);
  console.log(`  - Use defaultValue instead of default`);
  console.log(`\nReference: packages/promt/definition.ts`);
  
} else if (args.length > 0) {
  // Process specific package
  const pkgName = args[0];
  const defPath = path.join(packagesDir, pkgName, 'definition.ts');
  
  if (!fs.existsSync(defPath)) {
    console.error(`Package not found: ${pkgName}`);
    process.exit(1);
  }
  
  processDefinitionFile(defPath);
} else {
  console.log('Usage:');
  console.log('  node scripts/migrate-to-inputport.cjs <package-name>');
  console.log('  node scripts/migrate-to-inputport.cjs --all');
  process.exit(1);
}
