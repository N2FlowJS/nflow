#!/usr/bin/env node
/**
 * Quick fix: Remove config property from all definition.ts files
 * This is a temporary fix to allow build to succeed
 */

const fs = require('fs');
const path = require('path');

function removeConfig(filePath) {
  console.log(`Processing: ${path.basename(path.dirname(filePath))}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if has config
  if (!content.includes('config:') && !content.includes('configSchema:')) {
    console.log('  ✓ No config found\n');
    return;
  }
  
  // Remove entire config block
  // Pattern: config: { ... },
  const configPattern = /,?\s*config:\s*\{\s*properties:\s*\{[\s\S]*?\},?\s*defaults?:\s*\{[\s\S]*?\}[^}]*\},?\s*/g;
  
  const newContent = content.replace(configPattern, ',\n\n');
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('  ✓ Removed config block\n');
  } else {
    console.log('  ⚠ Could not parse config block\n');
  }
}

// Main
const root = process.cwd();
const packagesDir = path.join(root, 'packages');

const packages = fs.readdirSync(packagesDir)
  .filter(name => {
    const defPath = path.join(packagesDir, name, 'definition.ts');
    return fs.existsSync(defPath);
  });

console.log(`Found ${packages.length} packages\n`);

packages.forEach(pkg => {
  const defPath = path.join(packagesDir, pkg, 'definition.ts');
  try {
    removeConfig(defPath);
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}\n`);
  }
});

console.log('✓ Complete');
