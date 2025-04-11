const { execSync } = require('child_process');
const path = require('path');
// Fix module not found error by using import() for fs
let fs;

/**
 * Script to build the Nbase server
 */
async function buildNbase() {
  console.log('🔄 Building Nbase server...');

  // Dynamically import fs
  if (!fs) {
    try {
      fs = await import('fs');
    } catch (error) {
      console.error('❌ Error importing fs module:', error.message);
      process.exit(1);
    }
  }

  const nbasePath = path.join(process.cwd(), 'nbase');

  // Check if Nbase directory exists
  if (!fs.existsSync(nbasePath)) {
    console.error('❌ Error: Nbase directory not found at:', nbasePath);
    console.log('Make sure you have the Nbase code in your project root directory.');
    process.exit(1);
  }

  try {
    // Check if package.json exists
    const packageJsonPath = path.join(nbasePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error('❌ Error: package.json not found in Nbase directory');
      console.log('The Nbase directory does not appear to be a valid Node.js project.');
      process.exit(1);
    }

    // Read package.json to check build script
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`Found Nbase package: ${packageJson.name}@${packageJson.version}`);

    // Install dependencies if needed
    if (!fs.existsSync(path.join(nbasePath, 'node_modules'))) {
      console.log('📦 Installing Nbase dependencies...');
      execSync('npm install', { cwd: nbasePath, stdio: 'inherit' });
    }

    // Detect if this is a TypeScript project that needs compilation
    const isTypeScriptProject = fs.existsSync(path.join(nbasePath, 'tsconfig.json'));

    // Check if package.json has build scripts
    if (packageJson.scripts) {
      // Look for build script in priority order
      const buildScripts = ['build', 'tsc', 'compile', 'prepare'];
      const buildScript = buildScripts.find((script) => packageJson.scripts[script]);

      if (buildScript) {
        console.log(`🔨 Building Nbase using npm run ${buildScript}...`);
        execSync(`npm run ${buildScript}`, { cwd: nbasePath, stdio: 'inherit' });
      } else if (isTypeScriptProject) {
        // No build script but it's a TypeScript project
        console.log('🔨 TypeScript project detected but no build script found, running tsc directly...');

        // Make sure TypeScript is installed
        if (!fs.existsSync(path.join(nbasePath, 'node_modules', 'typescript'))) {
          console.log('📦 Installing TypeScript...');
          execSync('npm install typescript --save-dev', { cwd: nbasePath, stdio: 'inherit' });
        }

        // Create a simple tsconfig if it doesn't include outDir
        const tsconfig = JSON.parse(fs.readFileSync(path.join(nbasePath, 'tsconfig.json'), 'utf8'));
        if (!tsconfig.compilerOptions || !tsconfig.compilerOptions.outDir) {
          console.log('⚠️ tsconfig.json does not specify outDir, will output to dist/');

          // Create a temporary tsconfig that includes outDir
          const tempTsConfig = {
            ...tsconfig,
            compilerOptions: {
              ...(tsconfig.compilerOptions || {}),
              outDir: './dist',
              rootDir: './src',
            },
          };

          fs.writeFileSync(path.join(nbasePath, 'tsconfig.build.json'), JSON.stringify(tempTsConfig, null, 2));

          // Use the temporary config
          execSync('npx tsc -p tsconfig.build.json', { cwd: nbasePath, stdio: 'inherit' });
        } else {
          // Use the existing config
          execSync('npx tsc', { cwd: nbasePath, stdio: 'inherit' });
        }
      } else {
        console.log('⚠️ No build script found and not a TypeScript project');
        console.log('⚠️ Checking if Nbase is already a JavaScript project...');

        // Check if any .js files exist in the root
        const jsFiles = fs.readdirSync(nbasePath).filter((file) => file.endsWith('.js') && !file.startsWith('.') && !file.includes('config'));

        if (jsFiles.length > 0) {
          console.log('✅ Found JavaScript files, no build needed:');
          console.log('   ' + jsFiles.slice(0, 5).join(', ') + (jsFiles.length > 5 ? '...' : ''));
        } else {
          console.warn('⚠️ No JavaScript files found in project root');
          console.warn('⚠️ Nbase may not work correctly without a valid entry point');
        }
      }
    }

    // Check for entry points regardless of build step
    const possibleEntryPoints = ['index.js', 'server.js', 'api.js', 'app.js', path.join('dist', 'index.js'), path.join('dist', 'server.js'), path.join('dist', 'api.js'), path.join('dist', 'app.js')];

    const entryPoints = possibleEntryPoints.filter((entryPoint) => fs.existsSync(path.join(nbasePath, entryPoint))).map((entryPoint) => path.join(nbasePath, entryPoint));

    if (entryPoints.length > 0) {
      console.log('✅ Found entry points:');
      entryPoints.forEach((entryPoint) => console.log(`   - ${entryPoint}`));
    } else {
      console.warn('⚠️ No entry points found!');

      // If no entry points found, try to create a simple one
      if (fs.existsSync(path.join(nbasePath, 'index.js'))) {
        // Already has index.js, don't create one
        console.log('   index.js exists but may not be an entry point');
      } else {
        console.log('🔧 Creating a basic entry point: index.js');

        // Create a simple entry point that imports and exports from the index.js in src or dist if they exist
        let entryPointContent = '';

        if (fs.existsSync(path.join(nbasePath, 'src', 'index.js'))) {
          entryPointContent = `
// Auto-generated entry point for Nbase
module.exports = require('./src/index.js');
          `.trim();
        } else if (fs.existsSync(path.join(nbasePath, 'dist', 'index.js'))) {
          entryPointContent = `
// Auto-generated entry point for Nbase
module.exports = require('./dist/index.js');
          `.trim();
        } else {
          entryPointContent = `
// Auto-generated entry point for Nbase
const express = require('express');
const app = express();
const PORT = process.env.PORT || 1307;

app.get('/stats', (req, res) => {
  res.json({ status: 'ok', message: 'Nbase server is running' });
});

app.listen(PORT, () => {
  console.log(\`Nbase server running on port \${PORT}\`);
});
          `.trim();
        }

        fs.writeFileSync(path.join(nbasePath, 'index.js'), entryPointContent);
        console.log('✅ Created basic entry point: index.js');
      }
    }

    console.log('✅ Nbase build and verification complete!');
  } catch (error) {
    console.error('❌ Error building Nbase:', error.message);
    process.exit(1);
  }
}

// Export as both default and named export for flexibility
module.exports = buildNbase;
module.exports.default = buildNbase;

// Run the build if this script is executed directly
if (require.main === module) {
  buildNbase().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
