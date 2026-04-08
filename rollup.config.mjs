import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import uglify from '@lopatnov/rollup-plugin-uglify';
import packageJson from './package.json' with { type: 'json' };

const externalPackages = [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.peerDependencies || {})];

const isExternal = id => externalPackages.some(pkg => id === pkg || id.startsWith(`${pkg}/`));

export default {
  input: 'src/index.js',
  external: isExternal,
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    commonjs({
      include: ['node_modules/**'],
    }),
    babel({
      babelHelpers: 'runtime',
      babelrc: true,
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

