import { swc } from 'rollup-plugin-swc3';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import uglify from '@lopatnov/rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    commonjs({
      include: ['node_modules/**'],
    }),
    swc({
      include: /\.(js|jsx)$/,
      exclude: /node_modules/,
      tsconfig: false,
      jsc: {
        parser: {
          syntax: 'ecmascript',
          jsx: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
        externalHelpers: false,
      },
      env: {
        targets: {
          ie: '11',
          chrome: '58',
          firefox: '54',
          safari: '10',
          edge: '15',
        },
        mode: 'usage',
        coreJs: '3',
      },
      module: {
        type: 'es6',
      },
      sourceMaps: true,
    }),
    uglify({
      compress: {
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    }),
  ],
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    exports: 'named',
    sourcemap: true,
  },
};
