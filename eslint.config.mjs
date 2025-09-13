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

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended-legacy'
  ),
  {
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
  },
  // TypeScript-specific tweaks
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
  },
];

export default eslintConfig;
