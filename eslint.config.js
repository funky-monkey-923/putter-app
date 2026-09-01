// Flat ESLint config (ESLint 9+) applied repo-wide — deliberately one
// shared config rather than per-package configs, since the whole point at
// this scale is keeping CI's "lint" step meaningful without adding config
// overhead disproportionate to a solo project (see Architecture Plan §3's
// reasoning for the same tradeoff on monorepo tooling generally).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Underscore-prefixed args mark intentionally-unused parameters — used
      // by the reserved sync-hook stubs in dexie-repository.ts, and expected
      // to recur as more stub/interface methods get written. Same convention
      // extended to destructured vars for the immutable-field-stripping
      // pattern in update() (M0 team review fix).
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
