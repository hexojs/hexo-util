import hexoTs from 'eslint-config-hexo/ts';
import hexoTsTest from 'eslint-config-hexo/ts-test';
import importPlugin from 'eslint-plugin-import';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Configurations applied globally
  ...hexoTs,
  // Ignore specific files
  {
    ignores: [
      // Exclude auto-generated file from all linting
      'lib/highlight_alias.ts',
      // Exclude dist directory from all linting
      'dist',
      // Exclude tmp directory from all linting
      'tmp'
    ]
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  },
  // Import plugin for ESM import resolution and rules
  {
    plugins: {
      import: importPlugin
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      'n/no-missing-import': 'off',
      'node/no-extraneous-import': 'off'
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts', '.mjs', '.cjs']
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    }
  },
  // Configurations applied only to test files
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      ...hexoTsTest.languageOptions
    },
    rules: {
      ...hexoTsTest.rules,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      'node/no-unsupported-features/es-syntax': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-unused-vars': 0,
      'node/no-missing-require': 0,
      'node/no-missing-import': 0
    }
  },

  // Specific rules for JavaScript and CommonJS files
  {
    files: ['**/*.cjs'],

    rules: {
      '@typescript-eslint/no-var-requires': 'off', // Allow require() in CommonJS files
      '@typescript-eslint/no-require-imports': 'off' // Allow require imports
    }
  }
];
