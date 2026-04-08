import { swc } from 'rollup-plugin-swc3';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import uglify from '@lopatnov/rollup-plugin-uglify';
import packageJson from './package.json' with { type: 'json' };

// Automatically externalize all dependencies and peerDependencies.
// This prevents bundling tss-react, MUI, emotion etc. into dist and ensures
// the consuming app's single instance of each package is used (critical for
// React Context-based theme sharing with tss-react).
const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
];
const isExternal = (id) => externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

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
        // Aligned with MUI v7's official browser support policy:
        // https://mui.com/material-ui/getting-started/supported-platforms/
        targets: '> 0.5%, last 2 versions, Firefox ESR, not dead, safari >= 15.4, iOS >= 15.4',
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
