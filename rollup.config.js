import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import uglify from '@lopatnov/rollup-plugin-uglify';
import { createRequire } from 'module';

const pkg = createRequire(import.meta.url)('./package.json');

// Treat anything declared as a dependency or peerDependency as external —
// including subpath imports like `@babel/runtime-corejs3/helpers/extends` —
// since they belong to the consumer's resolution graph, not our bundle.
const externals = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];
const externalRegex = new RegExp(
  '^(' + externals.map((d) => d.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')).join('|') + ')(/|$)',
);

export default {
  input: 'src/index.ts',
  external: (id) => externalRegex.test(id),
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    resolve({
      extensions: ['.ts', '.tsx'],
    }),
    commonjs({
      include: ['node_modules/**'],
    }),
    babel({
      babelHelpers: 'runtime',
      babelrc: true,
      extensions: ['.ts', '.tsx'],
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
