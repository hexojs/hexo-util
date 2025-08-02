import fs from 'fs';
import path from 'path';
import { build, defineConfig } from 'tsup';
import { fileURLToPath } from 'url';
import packageJson from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

/**
 * Packages that should be bundled (not marked as external)
 * @type {string[]}
 */
const bundledPackages = [];

/**
 * All dependencies except those in bundledPackages will be marked as external
 * @type {string[]}
 */
const externalDeps = [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.devDependencies)].filter(
  pkgName => !bundledPackages.includes(pkgName)
);

/**
 * Build the project using tsup with custom config
 * @returns {Promise<void>}
 */
function buildTsup() {
  const baseConfig = defineConfig({
    entry: ['lib/**/*.ts'],
    splitting: true,
    treeshake: true,
    bundle: false,
    shims: true,
    sourcemap: true,
    removeNodeProtocol: true,
    clean: false,
    external: externalDeps,
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'dist',
    outExtension({ format }) {
      switch (format) {
        case 'cjs':
          return { js: '.cjs', dts: '.d.cts' };
        default:
          return { js: '.js', dts: '.d.ts' };
      }
    }
  });
  return build(baseConfig);
}

/**
 * Patch a .cjs file to rewrite local .js imports/requires to .cjs
 * @param {string} filePath
 */
function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Only replace paths that start with './' or '../' (local files), not bare module imports
  content = content.replace(/(require\(["'])(\.\.?\/[^"']+)\.js(["']\))/g, (match, p1, p2, p3) => {
    return `${p1}${p2}.cjs${p3}`;
  });
  content = content.replace(/(from\s+["'])(\.\.?\/[^"']+)\.js(["'])/g, (match, p1, p2, p3) => {
    return `${p1}${p2}.cjs${p3}`;
  });
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Recursively patch all .cjs files in a directory
 * @param {string} dir
 */
function doPatch(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      doPatch(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.cjs')) {
      patchFile(fullPath);
    }
  }
}

// Build and then patch .cjs imports
buildTsup().then(() => doPatch(distDir));
