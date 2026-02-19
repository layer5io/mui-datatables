const { register } = require('@swc-node/register/register');

register({
  extensions: ['.js', '.jsx'],
  module: {
    type: 'commonjs',
    strict: false,
    strictMode: false,
    noInterop: false,
  },
  jsc: {
    parser: {
      syntax: 'ecmascript',
      jsx: true,
      dynamicImport: true,
    },
    transform: {
      react: {
        runtime: 'automatic',
        development: true,
      },
    },
    target: 'es2018',
    keepClassNames: true,
  },
  sourcemap: true,
  ignore: [/node_modules/],
});

require('./setup-mocha-env');
