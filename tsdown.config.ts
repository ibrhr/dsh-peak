import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: 'esm',
    target: 'es2022',
    platform: 'node',
    dts: true,
    clean: true,
    sourcemap: true,
  },
  {
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: ['esm', 'cjs'],
    target: 'es2022',
    platform: 'browser',
    dts: true,
    clean: false,
    sourcemap: true,
  },
])
