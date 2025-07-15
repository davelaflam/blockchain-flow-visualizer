import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define globals directly instead of using the globals package
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  fetch: 'readonly',
  alert: 'readonly',
  confirm: 'readonly',
  prompt: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  HTMLElement: 'readonly',
  HTMLInputElement: 'readonly',
  Event: 'readonly',
  EventTarget: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
};

const nodeGlobals = {
  process: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  module: 'readonly',
  require: 'readonly',
  exports: 'writable',
};

const es2021Globals = {
  Promise: 'readonly',
  Map: 'readonly',
  Set: 'readonly',
  WeakMap: 'readonly',
  WeakSet: 'readonly',
  Symbol: 'readonly',
  Proxy: 'readonly',
  Reflect: 'readonly',
  BigInt: 'readonly',
  globalThis: 'readonly',
};

export default [
  // Global configuration
  {
    ignores: [
      '**/node_modules/**',
      '**/.pnp/**',
      '.pnp.js',
      '**/coverage/**',
      '**/build/**',
      '**/.DS_Store',
      '**/.env.local',
      '**/.env.development.local',
      '**/.env.test.local',
      '**/.env.production.local',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',
      '**/pnpm-debug.log*',
    ],
  },

  // Base JS/TS configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
        ...es2021Globals,
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          moduleDirectory: ['node_modules', 'src/'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: [resolve(__dirname, 'tsconfig.json'), resolve(__dirname, 'tsconfig.node.json')],
        },
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/core-modules': [],
      'import/ignore': ['node_modules', '\\.(coffee|scss|css|less|hbs|svg|json)$'],
    },
    rules: {
      // Base rules
      'no-console': 'error',
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // Handled by TypeScript
      'no-undef': 'off', // Handled by TypeScript

      // Prettier rules
      'prettier/prettier': [
        'warn',
        {
          arrowParens: 'avoid',
          bracketSpacing: true,
          endOfLine: 'auto',
          jsxBracketSameLine: false,
          printWidth: 120,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
        },
      ],

      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['off', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Temporarily disabled to allow 'any' type
      '@typescript-eslint/no-unsafe-assignment': 'off', // Temporarily disabled to allow operations on 'any' type
      '@typescript-eslint/no-unsafe-member-access': 'off', // Temporarily disabled to allow property access on 'any' type
      '@typescript-eslint/no-unsafe-call': 'off', // Temporarily disabled to allow calling methods on 'any' type
      '@typescript-eslint/no-unsafe-return': 'off', // Temporarily disabled to allow returning 'any' type
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',

      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-unresolved': 'error',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],

      // JSX A11Y rules
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    },
  },

  // TypeScript specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // TypeScript specific rules can be added here
    },
  },

  // Test files configuration (example)
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    rules: {
      // Test specific rules can be added here
    },
  },
];
