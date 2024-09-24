import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    { file: 'lib/index.cjs', format: 'cjs' },
    { file: 'lib/index.mjs', format: 'esm' },
  ],
  plugins: [typescript()],
  treeshake: true,
  external: ['@clustersxyz/sdk', 'arweave'],
};
