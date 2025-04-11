/**
 * Script to clean build artifacts and node_modules that might 
 * cause module resolution issues.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to clean
const PATHS_TO_CLEAN = [
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../.next'),
  path.resolve(__dirname, '../node_modules/.cache')
];

// Perform cleanup
console.log('Cleaning build artifacts...');
PATHS_TO_CLEAN.forEach(dirPath => {
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dirPath}`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Error removing ${dirPath}:`, err);
    }
  }
});

// Rebuild the project
console.log('\nRebuilding worker...');
try {
  execSync('npm run build:worker', { stdio: 'inherit' });
  console.log('Worker build complete');
} catch (err) {
  console.error('Worker build failed:', err);
  process.exit(1);
}

console.log('\nRebuilding Next.js app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Next.js build complete');
} catch (err) {
  console.error('Next.js build failed:', err);
  process.exit(1);
}

console.log('\nAll builds completed successfully!');
