module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'prettier'],
  ignorePatterns: ['dist', 'node_modules', '**/dist/**'],
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      // Native <dialog> element is interactive (role="dialog") but jsx-a11y does not
      // recognize it as such. Backdrop-click close is a standard UX pattern for dialogs.
      files: ['packages/shared/src/components/modal/Modal.tsx'],
      rules: {
        'jsx-a11y/no-noninteractive-element-interactions': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
      },
    },
    {
      // Separation boundary: the customer PWA and the shared platform must never pull in
      // admin-only heavy libraries. Admin viz/date-picker deps live only in apps/admin.
      files: ['apps/customer/**/*.{ts,tsx}', 'packages/shared/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              { name: 'recharts', message: 'Admin-only dependency — not allowed in the customer PWA or shared platform.' },
              { name: 'react-multi-date-picker', message: 'Admin-only dependency — not allowed in the customer PWA or shared platform.' },
              { name: 'react-date-object', message: 'Admin-only dependency — not allowed in the customer PWA or shared platform.' },
            ],
            patterns: ['**/apps/admin/**'],
          },
        ],
      },
    },
  ],
  settings: { react: { version: 'detect' } },
};
