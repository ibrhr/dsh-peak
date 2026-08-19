import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: 'esm',
    target: 'es2022',
    platform: 'node',
    dts: false,
    clean: true,
  },
  {
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: ['esm', 'cjs'],
    target: 'es2022',
    platform: 'browser',
    dts: false,
    clean: false,
  },
])
