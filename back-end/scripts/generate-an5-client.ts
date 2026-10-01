/**
 * Generates the typed an5 client from the `.an5` schema files.
 *
 * Run with `npm run db:generate` from the back-end directory.
 *
 * The published `@an5/orm` package ships a `generator/src/index.js` barrel that
 * requires `golang-generator`, which is missing from the npm tarball (the
 * published `build` script only runs `tsc -p tsconfig.json`, and that project
 * excludes `generator/`). Importing the barrel therefore throws
 * MODULE_NOT_FOUND. The three modules this project actually needs - the schema
 * parser, the TypeScript code generator and the metadata generator - are all
 * present, so they are imported directly.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

import { SchemaParser } from '@an5/orm/dist/generator/src/parser.js';
import { CodeGenerator } from '@an5/orm/dist/generator/src/code-generator.js';
import { MetadataGenerator } from '@an5/orm/dist/generator/src/metadata-generator.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

type An5Config = {
  schemaDir?: string;
  outputs?: {
    typescript?: { outputDir?: string; metadataFile?: string };
  };
};

function loadConfig(): An5Config {
  const configPath = path.join(rootDir, 'an5Orm.config.js');
  if (!fs.existsSync(configPath)) {
    throw new Error('an5Orm.config.js not found. Cannot generate the an5 client.');
  }
  return require(configPath) as An5Config;
}

function clearGeneratedOutput(outputDir: string, metadataFile: string): void {
  for (const entry of fs.readdirSync(outputDir)) {
    if (entry.endsWith('.ts')) {
      fs.unlinkSync(path.join(outputDir, entry));
    }
  }
  const absoluteMetadata = path.resolve(rootDir, metadataFile);
  if (absoluteMetadata.startsWith(path.resolve(outputDir) + path.sep) && fs.existsSync(absoluteMetadata)) {
    fs.unlinkSync(absoluteMetadata);
  }
}

/**
 * The generator emits plain `import { X } from './Other'` in the per-model
 * files, but every one of those bindings is used purely as a type. The project
 * compiles with `verbatimModuleSyntax`, so they must be type-only imports.
 * `base.ts` is skipped because it imports the runtime error class from
 * `@an5/orm`, and `index.ts` is skipped because it re-exports and namespace-
 * imports its siblings.
 */
function convertModelImportsToTypeOnly(outputDir: string): number {
  let patched = 0;
  for (const entry of fs.readdirSync(outputDir)) {
    if (!entry.endsWith('.ts') || entry === 'base.ts' || entry === 'index.ts') continue;
    const file = path.join(outputDir, entry);
    const source = fs.readFileSync(file, 'utf8');
    const patchedSource = source.replace(
      /^import\s+\{([^}]*)\}\s+from\s+('\.\/[^']*');?$/gm,
      (match, bindings: string, specifier: string) =>
        bindings.includes('type ') ? match : `import type {${bindings}} from ${specifier};`,
    );
    if (patchedSource !== source) {
      fs.writeFileSync(file, patchedSource);
      patched += 1;
    }
  }
  return patched;
}

/**
 * The generator wraps the shared filter/order types in `export namespace An5`
 * and then references them as `An5.StringFilter`, `An5.SortOrder`, ... in the
 * per-model files. The project compiles with `erasableSyntaxOnly`, which forbids
 * namespaces, so the namespace is flattened into plain top-level exports, the
 * qualified references are rewritten, and each model file imports the flattened
 * names it actually uses from `./base` (the project sets `noUnusedLocals`, so
 * importing the whole set would be an error).
 */
function flattenAn5Namespace(outputDir: string): boolean {
  const basePath = path.join(outputDir, 'base.ts');
  if (!fs.existsSync(basePath)) return false;

  const lines = fs.readFileSync(basePath, 'utf8').split('\n');
  const headerIndex = lines.findIndex((l) => l.trim() === 'export namespace An5 {');
  if (headerIndex === -1) return false;
  const footerIndex = lines.findIndex((l, i) => i > headerIndex && l.trim() === '}');
  if (footerIndex === -1) {
    throw new Error('Could not find the closing brace of `export namespace An5` in base.ts');
  }

  const memberLines = lines.slice(headerIndex + 1, footerIndex);
  const memberNames = memberLines
    .map((line) => /^\s*export\s+(?:type|const|interface|class)\s+(\w+)/.exec(line)?.[1])
    .filter((name): name is string => !!name);

  const members = memberLines.map((line) => (line.startsWith('  ') ? line.slice(2) : line));
  const rewrittenBase = [...lines.slice(0, headerIndex), ...members, ...lines.slice(footerIndex + 1)];
  fs.writeFileSync(basePath, rewrittenBase.join('\n'));

  for (const entry of fs.readdirSync(outputDir)) {
    if (!entry.endsWith('.ts') || entry === 'base.ts') continue;
    const file = path.join(outputDir, entry);
    const source = fs.readFileSync(file, 'utf8');

    // Drop the `An5` qualifier from `An5.StringFilter` -> `StringFilter`.
    const unqualified = source.replace(/\bAn5\.(?=[A-Z])/g, '');

    // Swap the `An5` binding in the `./base` import for the names this file uses.
    const patched = unqualified.replace(
      /^import\s+\{([^}]*)\}\s+from\s+('\.\/base');?$/m,
      (match, bindings: string, specifier: string, offset: number) => {
        const kept = bindings
          .split(',')
          .map((b) => b.trim())
          .filter((b) => b && b !== 'An5');
        const body = unqualified.slice(offset + match.length);
        for (const name of memberNames) {
          if (new RegExp(`\\b${name}\\b`).test(body) && !kept.includes(name)) {
            kept.push(name);
          }
        }
        return `import {${kept.join(', ')}} from ${specifier};`;
      },
    );
    if (patched !== source) fs.writeFileSync(file, patched);
  }
  return true;
}

/**
 * The generator's barrel `index.ts` only re-exports its siblings and declares
 * an `An5Client` class whose model delegates are declared but never assigned -
 * `new An5Client().user` is `undefined` at runtime. Nothing imports it, and it
 * would mislead anyone who tried, so it is removed. Import the per-model
 * modules and `an5Metadata` directly instead.
 */
function removeUnusedBarrel(outputDir: string): boolean {
  const indexPath = path.join(outputDir, 'index.ts');
  if (!fs.existsSync(indexPath)) return false;
  fs.unlinkSync(indexPath);
  return true;
}

async function main(): Promise<void> {
  const config = loadConfig();

  const schemaDir = path.resolve(rootDir, config.schemaDir || 'an5Schema');
  const outputDir = path.resolve(rootDir, config.outputs?.typescript?.outputDir || 'an5Client/typescript');
  const metadataFile = config.outputs?.typescript?.metadataFile || 'an5Client/typescript/an5Metadata.ts';

  if (!fs.existsSync(schemaDir)) {
    throw new Error(`Schema directory not found: ${schemaDir}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  clearGeneratedOutput(outputDir, metadataFile);

  const models = await new SchemaParser(schemaDir).parse();
  if (models.length === 0) {
    throw new Error(`No models found in ${schemaDir}`);
  }

  new CodeGenerator(outputDir).generate(models);
  new MetadataGenerator(path.resolve(rootDir, metadataFile)).generate(models);
  const flattened = flattenAn5Namespace(outputDir);
  const patched = convertModelImportsToTypeOnly(outputDir);
  const barrelRemoved = removeUnusedBarrel(outputDir);

  const tables = models.map((m) => `${m.name} -> [${m.schemaName}].[${m.tableName}]`);
  console.log(`an5 client generated for ${models.length} model(s):`);
  for (const t of tables) console.log(`  ${t}`);
  if (flattened) console.log('Flattened `namespace An5` in base.ts to satisfy erasableSyntaxOnly.');
  if (patched > 0) console.log(`Rewrote imports to type-only in ${patched} model file(s).`);
  if (barrelRemoved) console.log('Removed the unused index.ts barrel.');
  console.log(`Output: ${path.relative(rootDir, outputDir)}`);
}

main().catch((err) => {
  console.error('an5 client generation failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
