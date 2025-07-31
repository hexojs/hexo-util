import { defineConfig } from 'tsup';
import packageJson from './package.json' with { type: 'json' };

// Packages that should be bundled
const bundledPackages = [];

const externalDeps = [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.devDependencies)].filter(
  pkgName => !bundledPackages.includes(pkgName)
);

export default defineConfig({
  entry: ['lib/**/*.ts'],
  splitting: true,
  treeshake: true,
  bundle: false,
  sourcemap: true,
  clean: true,
  external: externalDeps,
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  outExtension({ format }) {
    return format === 'cjs' ? { js: '.cjs' } : { js: '.js' };
  }
});
