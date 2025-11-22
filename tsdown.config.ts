import { defineConfig } from 'tsdown';

const pkgName = 'stylecast';

export default defineConfig({
  name: pkgName,
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs', 'iife'],
  target: 'es2020',
  sourcemap: true,
  clean: true,
  dts: true,
  exports: true,
  treeshake: true,
  outputOptions: {
    name: pkgName,
  },
});
