#!/usr/bin/env node
/**
 * Auto-fix common migration issues in definition.ts files
 * 
 * Fixes:
 * 1. getDynamicInputs returning string[] instead of InputPort[]
 * 2. status: 'waiting' → status: 'success'
 * 3. Backtick+n artifacts (`n) → newline
 */

const fs = require('fs');
const path = require('path');

function fixGetDynamicInputs(content) {
  // Pattern: getDynamicInputs returns string[]
  const pattern = /(getDynamicInputs:\s*\(config[^)]*\)\s*=>\s*\{[\s\S]*?)return\s+inputs;/g;
  
  return content.replace(pattern, (match, before) => {
    // Check if already returns InputPort[]
    if (match.includes('return variableNames.map')) {
      return match;
    }
    
    return before + `return variableNames.map((varName) => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      description: \`Template variable: {\${varName}}\`,
      required: false,
      metadata: {
        isDynamic: true,
        sourceTemplate: \`{\${varName}}\`,
      },
    }));`;
  });
}

function fixWaitingStatus(content) {
  // Replace status: 'waiting' with graceful handling
  const pattern = /if\s*\([^{]*\)\s*\{\s*return\s*\{[\s\S]*?status:\s*'waiting'[\s\S]*?\};[\s\S]*?\}/g;
  
  return content.replace(pattern, (match) => {
    // Extract the condition and waitingFor
    const condMatch = match.match(/if\s*\(([^{]*)\)/);
    const waitingForMatch = match.match(/waitingFor:\s*([^,\n}]+)/);
    
    if (!condMatch || !waitingForMatch) return match;
    
    return match.replace(/status:\s*'waiting'/, "status: 'success'");
  });
}

function fixBacktickN(content) {
  // Fix `n artifacts (should be newline)
  return content.replace(/`n\s+/g, '\n      ');
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix backtick+n
  const fixed1 = fixBacktickN(content);
  if (fixed1 !== content) {
    console.log('  ✓ Fixed backtick+n artifacts');
    content = fixed1;
    modified = true;
  }
  
  // Fix getDynamicInputs
  const fixed2 = fixGetDynamicInputs(content);
  if (fixed2 !== content) {
    console.log('  ✓ Fixed getDynamicInputs return type');
    content = fixed2;
    modified = true;
  }
  
  // Fix waiting status
  const fixed3 = fixWaitingStatus(content);
  if (fixed3 !== content) {
    console.log('  ✓ Fixed status: waiting → success');
    content = fixed3;
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  → File updated\n');
  } else {
    console.log('  → No changes needed\n');
  }
}

// Main
const args = process.argv.slice(2);
const root = process.cwd();
const packagesDir = path.join(root, 'packages');

if (args.includes('--all')) {
  const packages = fs.readdirSync(packagesDir)
    .filter(name => {
      const defPath = path.join(packagesDir, name, 'definition.ts');
      return fs.existsSync(defPath);
    });
  
  console.log(`Found ${packages.length} packages\n`);
  
  packages.forEach(pkg => {
    const defPath = path.join(packagesDir, pkg, 'definition.ts');
    try {
      processFile(defPath);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}\n`);
    }
  });
  
  console.log('✓ Complete');
  
} else if (args.length > 0) {
  const pkgName = args[0];
  const defPath = path.join(packagesDir, pkgName, 'definition.ts');
  
  if (!fs.existsSync(defPath)) {
    console.error(`Package not found: ${pkgName}`);
    process.exit(1);
  }
  
  processFile(defPath);
} else {
  console.log('Usage:');
  console.log('  node scripts/fix-definition-issues.cjs <package-name>');
  console.log('  node scripts/fix-definition-issues.cjs --all');
  process.exit(1);
}
