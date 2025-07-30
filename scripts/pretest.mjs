import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const libDir = path.resolve(__dirname, '../lib');
const markerFile = path.resolve(__dirname, '../.last_build');
const extraFiles = [
  path.resolve(__dirname, '../test/utils.cjs'),
  path.resolve(__dirname, '../test/dual_mode.spec.ts'),
  __filename
];

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

function needsBuild() {
  if (!fs.existsSync(markerFile)) return true;
  const markerMtime = fs.statSync(markerFile).mtimeMs;
  const files = getAllFiles(libDir).concat(extraFiles);
  return files.some(f => fs.existsSync(f) && fs.statSync(f).mtimeMs > markerMtime);
}

function isTestEnv() {
  return (
    process.env.MOCHA || process.argv.some(arg => arg.includes('mocha')) || process.env.JEST_WORKER_ID !== undefined
  );
}

// If the marker file is older than the source files, rebuild
if (needsBuild() && !isTestEnv()) {
  console.log('Building hexo-util...');
  const result = spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true
  });
  if (result.status !== 0) {
    throw new Error(`Build failed with exit code ${result.status || 1}`);
  }
  fs.writeFileSync(markerFile, String(Date.now()));
}

// Convert extension to .cjs for CommonJS files

/**
 * Recursively updates all import/require extensions from .js to .cjs, then copies .js files to .cjs in the specified directory and its subdirectories.
 * > while running CJS under ESM environment, we need to ensure that all CommonJS files use .cjs extension to avoid conflicts.
 * @param {string} [dir] - The directory to start from. Defaults to '../dist/cjs' relative to this file.
 */
function convertCjs(dir) {
  if (!dir) {
    dir = path.join(__dirname, '../dist/cjs');
  }
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      convertCjs(filePath);
    } else if (file.endsWith('.js')) {
      // Update import/require extensions in the file
      let content = fs.readFileSync(filePath, 'utf8');
      // Replace only local require/import paths ending with .js to .cjs, but not directory imports (e.g. './dir')
      // require('./foo.js') or require('../foo.js'), but NOT require('./dir')
      content = content.replace(/(require\(["'`].*?)([^/]+)\.js(["'`]\))/g, (match, p1, filename, p3) => {
        // Only replace if path is local and not a directory import
        return /require\(["'`](\.|\.\.)\//.test(match) ? p1 + filename + '.cjs' + p3 : match;
      });
      // import ... from './foo.js' or '../foo.js', but NOT from './dir'
      content = content.replace(/(from\s+["'`].*?)([^/]+)\.js(["'`])/g, (match, p1, filename, p3) => {
        return /from\s+["'`](\.|\.\.)\//.test(match) ? p1 + filename + '.cjs' + p3 : match;
      });
      // dynamic import('./foo.js') or import('../foo.js'), but NOT import('./dir')
      content = content.replace(/(import\s*\(["'`].*?)([^/]+)\.js(["'`]\))/g, (match, p1, filename, p3) => {
        return /import\s*\(["'`](\.|\.\.)\//.test(match) ? p1 + filename + '.cjs' + p3 : match;
      });
      fs.writeFileSync(filePath, content, 'utf8');
      // Copy the file with .cjs extension instead of renaming
      const newPath = filePath.replace(/\.js$/, '.cjs');
      fs.copyFileSync(filePath, newPath);
      // console.log(`Updated imports and copied: ${filePath} -> ${newPath}`);
    }
  });
}

convertCjs(); // Ensure CJS files are renamed before running tests
