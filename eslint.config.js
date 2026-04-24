const pluginReact = require('eslint-plugin-react');
const pluginJsxA11y = require('eslint-plugin-jsx-a11y');
const pluginReactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'build/**', 'coverage/**', 'docs/**'],
  },
  {
    files: ['src/**/*.{js,jsx}', 'examples/**/*.{js,jsx}', 'test/**/*.{js,jsx}', '*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
        ...globals.es2020,
      },
    },
    settings: {
      react: {
        version: 'latest',
      },
    },
    plugins: {
      react: pluginReact,
      'jsx-a11y': pluginJsxA11y,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginJsxA11y.configs.recommended.rules,
      'no-console': 'off',
      semi: 2,
      'no-undef': 2,
      'no-undef-init': 2,
      'no-tabs': 2,
      'react/self-closing-comp': 2,
      'react/no-typos': 2,
      'react/jsx-no-duplicate-props': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/no-autofocus': [
        2,
        {
          ignoreNonDOM: true,
        },
      ],
    },
  },
];
