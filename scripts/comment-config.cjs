#!/usr/bin/env node
/**
 * Quick fix: Comment out config property temporarily
 */

const fs = require('fs');
const path = require('path');

function commentOutConfig(filePath) {
  const pkgName = path.basename(path.dirname(filePath));
  console.log(`Processing: ${pkgName}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if has config
  if (!content.includes('config:') && !content.includes('configSchema:')) {
    console.log('  ✓ No config found\n');
    return;
  }
  
  // Simple replace - comment out the config line and mark for migration
  let modified = false;
  
  // Match: config: {
  if (content.match(/^\s*config:\s*\{/m)) {
    content = content.replace(/^(\s*)(config:\s*\{)/gm, '$1// TODO: Migrate to inputs - $2');
    modified = true;
  }
  
  // Match: configSchema: {
  if (content.match(/^\s*configSchema:\s*\{/m)) {
    content = content.replace(/^(\s*)(configSchema:\s*\{)/gm, '$1// TODO: Migrate to inputs - $2');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  ✓ Commented out config\n');
  } else {
    console.log('  ⚠ No changes\n');
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
    commentOutConfig(defPath);
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}\n`);
  }
});

console.log('✓ Complete - All config blocks commented out');
console.log('\nNOTE: This is temporary! Packages still need proper migration.');
console.log('See MIGRATION-TODO.md for migration guide.');
