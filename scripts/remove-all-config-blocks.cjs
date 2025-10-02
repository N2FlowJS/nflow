/**
 * Auto-Migration Script: Remove config blocks from all packages
 * 
 * This script removes config/configSchema blocks from NodeDefinition
 * for all packages that still have them.
 */

const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');

function removeConfigBlock(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern 1: config: { properties: { ... }, },
    const configPattern1 = /\n\s+\/\/\s*Configuration Schema[\s\S]*?\n\s+config:\s*\{[\s\S]*?\n\s+\},\s*\n/g;
    
    // Pattern 2: config: { properties: { ... } }, (no trailing comma on closing brace)
    const configPattern2 = /\n\s+\/\/\s*Configuration Schema[\s\S]*?\n\s+config:\s*\{[\s\S]*?\n\s+\}\s*,?\s*\n/g;
    
    // Pattern 3: Just config block without comment
    const configPattern3 = /\n\s+config:\s*\{[\s\S]*?\n\s+\},\s*\n/g;
    
    const original = content;
    content = content.replace(configPattern1, '\n');
    content = content.replace(configPattern2, '\n');
    content = content.replace(configPattern3, '\n');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanAndRemoveConfig() {
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  let fixed = 0;
  let skipped = 0;
  
  for (const pkg of packages) {
    const defPath = path.join(packagesDir, pkg, 'definition.ts');
    
    if (!fs.existsSync(defPath)) {
      skipped++;
      continue;
    }
    
    const removed = removeConfigBlock(defPath);
    if (removed) {
      console.log(`✅ Removed config from: ${pkg}`);
      fixed++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Fixed: ${fixed}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  📦 Total: ${packages.length}`);
}

console.log('🚀 Starting auto-migration: Removing config blocks...\n');
scanAndRemoveConfig();
console.log('\n✨ Migration complete!');
console.log('⚠️  Run `npm run typecheck` to verify remaining errors');
