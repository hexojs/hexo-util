const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const _filename = fileURLToPath(__filename ? `file://${__filename}` : __filename);
const _dirname = path.dirname(_filename);

/**
 * Recursively updates all import/require extensions from .js to .cjs, then copies .js files to .cjs in the specified directory and its subdirectories.
 * @param {string} [dir] - The directory to start from. Defaults to '../dist/cjs' relative to this file.
 */
function convertCjs(dir = path.join(_dirname, '../dist/cjs')) {
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
      console.log(`Updated imports and copied: ${filePath} -> ${newPath}`);
    }
  });
}
module.exports.convertCjs = convertCjs;

/**
 * Import modules based on the specified mode.
 * @param {'esm'|'cjs'} mode
 * @returns
 */
async function importModules(mode) {
  if (mode === 'esm') {
    return {
      lib: await import('../dist/esm/index.js'),
      mode
    };
  }
  convertCjs(); // Ensure CJS files are renamed before importing
  const cjsModule = await import('../dist/cjs/index.cjs');
  return {
    lib: cjsModule.default || cjsModule,
    mode
  };

}

module.exports.importModules = importModules;
