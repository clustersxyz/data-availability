import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: [
    { file: 'lib/index.cjs', format: 'cjs' },
    { file: 'lib/index.mjs', format: 'esm' },
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript(),
  ],
  treeshake: true,
  external: ['@clustersxyz/sdk'],
};
