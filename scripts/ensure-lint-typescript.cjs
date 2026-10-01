/**
 * The workspace compiles with TypeScript 7 (tsgo), which ships only a native
 * `tsc` binary and no JavaScript compiler API.
 *
 * The `typescript-eslint` toolchain needs that API to build its AST and run
 * type-aware rules, and its peer range is `>=4.8.4 <6.1.0`. So we keep a
 * second, nested copy of TypeScript 6 inside each package that requires it:
 * ESLint's toolchain resolves that copy, while `tsc` on the PATH stays on 7.
 *
 * A plain `npm install` prunes those nested copies, so this script restores
 * them. Failures are warnings, not errors: linting is optional, the build is not.
 */
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const modules = path.join(root, 'node_modules');
const LINT_TS_VERSION = '6.0.3';

/** Packages in the typescript-eslint chain that `require('typescript')`. */
const LINT_TOOLCHAIN = [
  '@typescript-eslint/parser',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/scope-manager',
  '@typescript-eslint/visitor-keys',
  'ts-api-utils',
];

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function resolveFrom(dir) {
  try {
    return require(require.resolve('typescript', { paths: [dir] }));
  } catch {
    return null;
  }
}

/** A TypeScript build the lint toolchain can actually use. */
function hasCompilerApi(ts) {
  return Boolean(ts && typeof ts.createProgram === 'function' && ts.Extension);
}

function main() {
  const problems = [];
  const fixed = [];

  for (const name of LINT_TOOLCHAIN) {
    const dir = path.join(modules, ...name.split('/'));
    if (!fs.existsSync(dir)) {
      problems.push(`${name} is not installed`);
      continue;
    }
    if (hasCompilerApi(resolveFrom(dir))) continue;

    try {
      execFileSync(
        npm,
        [
          'install',
          '--no-save',
          '--ignore-scripts',
          '--legacy-peer-deps',
          `typescript@${LINT_TS_VERSION}`,
        ],
        { cwd: dir, stdio: 'pipe' },
      );
    } catch {
      problems.push(`${name}: install failed`);
      continue;
    }

    if (hasCompilerApi(resolveFrom(dir))) fixed.push(name);
    else problems.push(`${name}: installed but still lacks the compiler API`);
  }

  for (const name of fixed) {
    console.log(`[lint-ts] installed TypeScript ${LINT_TS_VERSION} for ${name}`);
  }

  if (problems.length > 0) {
    console.warn(
      `[lint-ts] Some packages still resolve the workspace TypeScript 7 and cannot lint:\n` +
        problems.map((p) => `         - ${p}`).join('\n') +
        `\n         Run: node scripts/ensure-lint-typescript.cjs  (or downgrade TypeScript to <6.1)`,
    );
    return;
  }

  console.log(`[lint-ts] OK — the ESLint toolchain has TypeScript ${LINT_TS_VERSION}.`);
}

main();
