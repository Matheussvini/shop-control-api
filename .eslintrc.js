module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/recommended', 'plugin:prettier/recommended'],
  rules: {
    'import/no-unresolved': 'error',
    'import/order': 'warn',
    'import/no-named-as-default-member': 'off',
    '@typescript-eslint/no-namespace': 'off',
    'import/newline-after-import': ['error'],
    'lines-between-class-members': ['error', 'always'],
    '@typescript-eslint/no-unused-vars': ['warn'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'warn', // Emite um aviso ao usar `any`
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': { typescript: {}, node: {} },
  },
};
