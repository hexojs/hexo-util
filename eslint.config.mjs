/**
 * @type {import('eslint').Linter.Config}
 */
export default {
  root: true,
  extends: ['hexo/ts.js'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      node: {
        extensions: ['.js', '.ts']
      }
    }
  }
};
