// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,

  // Type-aware rules — only TS/TSX files (requires TypeScript compiler)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Errors — block CI
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        // async event handlers (onPress, onChangeText, etc.) are intentional
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/await-thenable': 'error',
      // bare `return promise` inside try/catch swallows errors; enforce return await
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/no-explicit-any': 'error',

      // Warnings — address incrementally
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/prefer-optional-chain': 'warn',
      'no-shadow': 'off', // replaced by the TS-aware version below
      '@typescript-eslint/no-shadow': 'warn',
    },
  },

  // Rules for all files
  {
    rules: {
      'no-console': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  {
    ignores: ['dist/*', '.expo/**'],
  },
]);
