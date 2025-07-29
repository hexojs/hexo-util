import { defineConfig } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import hexoTs from 'eslint-config-hexo/ts';
import hexoTsTest from 'eslint-config-hexo/ts-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  // Configurations applied globally
  ...hexoTs,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
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
      'node/no-missing-require': 0
    }
  }
];
