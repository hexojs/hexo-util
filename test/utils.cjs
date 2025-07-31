// const path = require('path');
// const { fileURLToPath } = require('url');

// const _filename = fileURLToPath(__filename ? `file://${__filename}` : __filename);
// const _dirname = path.dirname(_filename);

/**
 * Import modules based on the specified mode.
 * @param {'esm'|'cjs'} mode
 * @returns
 */
async function importModules(mode) {
  if (mode === 'esm') {
    return {
      lib: await import('../dist/index.js'),
      mode
    };
  }
  // eslint-disable-next-line import/no-unresolved
  const cjsModule = await import('../dist/index.cjs');
  return {
    lib: cjsModule.default || cjsModule,
    mode
  };
}

module.exports.importModules = importModules;
