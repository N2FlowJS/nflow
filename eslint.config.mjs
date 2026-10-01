// @ts-check
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

/**
 * Type-aware linting needs a TypeScript with a JavaScript compiler API.
 * The workspace compiles with TypeScript 7 (native `tsc`, no JS API), so
 * `scripts/ensure-lint-typescript.cjs` keeps a nested TypeScript 6 copy inside
 * the parser. The parser then resolves that copy instead of the workspace one.
 */
const BACKEND_PROJECT = './back-end/tsconfig.json';
const FRONTEND_PROJECT = './front-end/tsconfig.json';

const baseRules = {
  // Correctness — the errors that should never be committed.
  eqeqeq: ['error', 'smart'],
  'no-var': 'error',
  'prefer-const': ['error', { destructuring: 'all' }],
  'no-implicit-coercion': ['error', { boolean: false }],
  'no-param-reassign': ['error', { props: false }],
  'no-shadow': 'error',
  'no-return-await': 'error',
  'no-throw-literal': 'error',
  'no-unsafe-finally': 'error',
  'no-constant-condition': ['error', { checkLoops: false }],
};

/** Rules that need the TypeScript plugin (and a type-aware program). */
const tsRules = {
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
  ],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
  ],
  // No `any` in the codebase: provider SDK boundaries, request payloads and
  // response envelopes are all narrowed (`unknown` + explicit shapes) instead.
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-empty-object-type': 'error',
  '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }],

  // Type-aware: catches real bugs tsc does not.
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': [
    'error',
    { checksVoidReturn: { attributes: false } },
  ],
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/no-for-in-array': 'error',
  '@typescript-eslint/no-implied-eval': 'error',
  '@typescript-eslint/restrict-plus-operands': 'error',
  '@typescript-eslint/unbound-method': 'error',
};

/** Rules that only make sense in a React tree. */
const reactRules = {
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/test-output/**',
      // VitePress build artefacts.
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**',
      // Generated clients — not hand-written, not ours to lint.
      'back-end/lib/prisma-client/**',
      'back-end/an5Client/**',
    ],
  },

  js.configs.recommended,

  // Plain JS / CJS: build scripts and tooling, not part of either TS project.
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'module',
    },
    rules: {
      ...baseRules,
      // Plain JS has no type system to lean on.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
    rules: {
      ...baseRules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...baseRules,
      ...tsRules,
      // Base JS rules that TypeScript already covers more accurately.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-dupe-class-members': 'off',
      'no-dupe-args': 'off',
      'no-unreachable': 'off',
      'no-cond-assign': 'off',
      'no-control-regex': 'off',
    },
  },

  {
    files: ['back-end/**/*.ts', 'back-end/**/*.tsx'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { project: BACKEND_PROJECT, tsconfigRootDir: import.meta.dirname },
    },
  },

  {
    files: ['front-end/**/*.ts', 'front-end/**/*.tsx'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { project: FRONTEND_PROJECT, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: reactRules,
  },

  {
    files: ['packages/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { project: BACKEND_PROJECT, tsconfigRootDir: import.meta.dirname },
    },
  },

  {
    files: ['front-end/test/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },

  // Must stay last: turns off every stylistic rule Prettier already owns.
  prettier,
];
