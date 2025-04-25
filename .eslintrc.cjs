module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Permitir el uso de 'any'
    '@typescript-eslint/no-explicit-any': 'off',
    
    // Reglas básicas
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'warn',
    
    // Reglas de formato (que no colisionen con Prettier)
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    
    // Reglas TypeScript 
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_', 
      'varsIgnorePattern': '^_' 
    }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'warn'
  }
}; 