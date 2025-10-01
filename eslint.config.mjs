import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [{
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}, // Ignore generated and build artifacts
{
  ignores: [
    '**/node_modules/**',
    '.next/**',
    'dist/**',
    'coverage/**',
    // Prisma generated client and runtime files (minified/bundled)
    'prisma/client/**',
    'prisma/**/runtime/**',
  ],
}, ...compat.extends(
  'next/core-web-vitals',
  'next/typescript',
  'eslint:recommended',
  'plugin:react/recommended',
  'plugin:react-hooks/recommended-legacy'
), {
  settings: {
    react: {
      version: 'detect',
    },
  },
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      NodeJS: 'readonly',
    },
  },
  rules: {
    // Using React 17+ JSX transform; no need to import React in scope
    'react/react-in-jsx-scope': 'off',
    // Allow styled-jsx props used by Next.js
    'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
    // PropTypes not used in TypeScript codebases
    'react/prop-types': 'off',
    // Delegate unused checks to TS version
    'no-unused-vars': 'off',
    // Reduce noise on intentional constructs
    'no-constant-condition': 'warn',
    'no-empty': ['warn', { allowEmptyCatch: true }],
  },
}, // TypeScript-specific tweaks
{
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    // TS type-checker handles undefined symbols; this rule is noisy for TS
    'no-undef': 'off',
    // Start as a warning; plan to fix incrementally
    '@typescript-eslint/no-explicit-any': 'warn',
    // Prefer TS rule and allow ignored underscores
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
}, // CommonJS/node scripts (allow require and CJS globals)
{
  files: ['**/*.cjs', 'scripts/**/*.{js,cjs}', '**/*.js'],
  languageOptions: {
    sourceType: 'commonjs',
    globals: {
      require: 'readonly',
      module: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      process: 'readonly',
    },
  },
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
}];

export default eslintConfig;
