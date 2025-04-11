/**
 * Script to clean build artifacts and cache
 */
const fs = require('fs');
const path = require('path');

// Paths to clean
const PATHS_TO_CLEAN = [
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

console.log('Cleanup complete.');
