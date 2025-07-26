/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel').babel;
const json = require('@rollup/plugin-json');
const fs = require('fs');
const dts = require('rollup-plugin-dts').dts;

const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');

/** @type {import('./package.json')} */
const packageJson = JSON.parse(packageJsonContent);

/**
 * Packages that should be bundled (not externalized)
 * @type {string[]}
 */
const bundledPackages = [];

/**
 * List external dependencies, excluding specific packages that should be bundled
 * @type {string[]}
 */
const externalPackages = Array.from(new Set([
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.devDependencies)
]));

/**
 * Returns a function to generate entry file names with the given extension for Rollup output.
 *
 * For files from node_modules, places them in the dependencies folder and logs the mapping.
 *
 * @param {string} ext The file extension (e.g. 'js', 'cjs', 'mjs').
 * @returns {(info: { facadeModuleId: string }) => string} Function that generates the output file name for a given entry.
 */
function entryFileNamesWithExt(ext) {
  // Ensure the extension does not start with a dot
  if (ext.startsWith('.')) {
    ext = ext.slice(1);
  }
  return function({ facadeModuleId }) {
    facadeModuleId = facadeModuleId.split(path.sep).join(path.posix.sep);
    if (!facadeModuleId.includes('node_modules')) {
      return `[name].${ext}`;
    }
    // Replace all occurrences of 'node_modules' with 'dependencies'
    let rel = facadeModuleId.replace(/node_modules/g, 'dependencies');
    // Remove everything before the first 'dependencies/'
    const depIdx = rel.indexOf('dependencies/');
    if (depIdx !== -1) {
      rel = rel.slice(depIdx);
    }
    // Remove extension using upath.extname
    rel = rel.slice(0, -path.extname(rel).length) + `.${ext}`;
    // Remove any null bytes (\x00) that may be present (Rollup sometimes injects these)
    rel = rel.replace(/\0/g, '');
    // Remove any leading slashes
    rel = rel.replace(/^\/\/+/, '');

    fs.appendFileSync(
      'tmp/rollup.log',
      `entryFileNamesWithExt:\n  [facadeModuleId] ${facadeModuleId}\n  [rel] ${rel}\n`
    );
    return rel;
  };
}

/**
 * Returns a function to generate chunk file names with the given extension for Rollup output.
 *
 * For chunks from node_modules, places them in the dependencies folder and removes the original extension.
 *
 * @param {string} ext The file extension (e.g. 'js', 'cjs', 'mjs').
 * @returns {(info: { name: string }) => string} Function that generates the output file name for a given chunk.
 */
function chunkFileNamesWithExt(ext) {
  return function({ name }) {
    // For node_modules chunks, place in dependencies folder
    if (name && name.includes('node_modules')) {
      // Replace all occurrences of 'node_modules' with 'dependencies'
      let rel = name.replace(/node_modules/g, 'dependencies');
      // Remove everything before the first 'dependencies/'
      const depIdx = rel.indexOf('dependencies/');
      if (depIdx !== -1) {
        rel = rel.slice(depIdx);
      }
      // Remove extension using upath.extname
      rel = rel.slice(0, -path.extname(rel).length);
      // Remove any null bytes (\x00) that may be present
      rel = rel.replace(/\0/g, '');
      // Remove any leading slashes
      rel = rel.replace(/^\/\/+/, '');
      return `${rel}-[hash].${ext}`;
    }
    // For local chunks, keep the default pattern
    return `[name]-[hash].${ext}`;
  };
}

/**
 * Rollup external filter function.
 * Determines if a module should be treated as external (not bundled) or bundled.
 *
 * @param {string} source - The import path or module ID.
 * @param {string} importer - The path of the importing file.
 * @param {boolean} isResolved - Whether the import has been resolved.
 * @returns {boolean} True if the module should be external, false if it should be bundled.
 */
function externalPackagesFilter(source, importer, isResolved) {
  function getPackageNameFromSource(source) {
    // Handle absolute paths (Windows/Unix)
    const nm = /node_modules[\\/]+([^\\/]+)(?:[\\/]+([^\\/]+))?/.exec(source);
    if (nm) {
      // Scoped package
      if (nm[1].startsWith('@') && nm[2]) {
        return nm[1] + '/' + nm[2];
      }
      return nm[1];
    }
    // Handle bare imports
    if (source.startsWith('@')) {
      return source.split('/').slice(0, 2).join('/');
    }
    return source.split('/')[0];
  }

  const pkgName = getPackageNameFromSource(source);
  const isBundled = bundledPackages.includes(pkgName);
  const isExternal = externalPackages.includes(pkgName);

  if (bundledPackages.some(pkg => source.includes(pkg))) {
    const treeLog = [
      'externalFilter',
      `\t├─ source:     ${source}`,
      `\t├─ pkgName:    ${pkgName}`,
      `\t├─ external:   ${String(isExternal)}`,
      `\t├─ bundled:    ${String(isBundled)}`,
      `\t├─ importer:   ${(importer || '-').replace(process.cwd(), '').replace(/^\//, '')}`,
      `\t└─ isResolved: ${String(isResolved)}`
    ].join('\n');
    console.log(treeLog);
  }

  if (isBundled) return false; // <-- force bundle
  if (isExternal) return true; // <-- mark as external
  return false; // fallback: bundle it
}


/** @type {import('rollup').RollupOptions} */
module.exports = [
  {
    input: 'tmp/dist/index.js',
    output: [
      {
        dir: 'dist',
        format: 'esm',
        sourcemap: false,
        preserveModules: true,
        preserveModulesRoot: 'tmp/dist',
        entryFileNames: entryFileNamesWithExt('mjs'),
        chunkFileNames: chunkFileNamesWithExt('mjs')
      },
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: false,
        preserveModules: true,
        preserveModulesRoot: 'tmp/dist',
        entryFileNames: entryFileNamesWithExt('js'),
        chunkFileNames: chunkFileNamesWithExt('js')
      }
    ],
    plugins: [
      nodeResolve({ extensions: ['.ts', '.js', '.json', '.mjs', '.cjs', '.node'] }),
      commonjs(),
      json(),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts', '.js', '.json', '.mjs', '.cjs', '.node'],
        include: ['tmp/dist/**/*'],
        presets: [
          ['@babel/preset-env', { targets: { node: '12' } }]
        ]
      })
    ],
    external: externalPackagesFilter
  },
  // New entry for TypeScript declarations
  {
    input: 'lib/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'lib',
      entryFileNamesWithExt: entryFileNamesWithExt('d.ts'),
      chunkFileNamesWithExt: chunkFileNamesWithExt('d.ts')
    },
    plugins: [
      dts()
    ]
  }
];
