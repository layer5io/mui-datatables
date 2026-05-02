require('@babel/register')({
  extensions: ['.js', '.jsx'],
  babelrc: false,
  configFile: false,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'commonjs',
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-object-rest-spread',
    '@babel/plugin-transform-async-to-generator',
    ['@babel/plugin-transform-runtime', { corejs: 3, regenerator: true }],
  ],
  ignore: [/node_modules/],
});

require('./setup-mocha-env');
