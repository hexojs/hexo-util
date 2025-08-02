import spawn from 'cross-spawn';
import CacheStream from './cache_stream.js';

import { SpawnOptions } from 'child_process';
interface Options extends SpawnOptions {
  verbose?: boolean;
  encoding?: BufferEncoding;
}

class StatusError extends Error {
  code?: number;
}

export function promiseSpawn(command: string, args: string | string[] | Options = [], options: Options = {}) {
  if (!command) throw new TypeError('command is required!');

  if (typeof args === 'string') args = [args];

  if (!Array.isArray(args)) {
    options = args;
    args = [];
  }

  return new Promise<string | Buffer | void>((resolve, reject) => {
    const task = spawn(command, args as string[], options);
    const verbose = options.verbose;
    const { encoding = 'utf8' } = options;
    const stdoutCache = new CacheStream();
    const stderrCache = new CacheStream();

    if (task.stdout) {
      const stdout = task.stdout.pipe(stdoutCache);
      if (verbose) stdout.pipe(process.stdout);
    }

    if (task.stderr) {
      const stderr = task.stderr.pipe(stderrCache);
      if (verbose) stderr.pipe(process.stderr);
    }

    task.on('close', code => {
      if (code) {
        const e = new StatusError(getCache(stderrCache, encoding) as string);
        e.code = code;

        return reject(e);
      }

      resolve(getCache(stdoutCache, encoding));
    });

    task.on('error', reject);

    // Listen to exit events if neither stdout and stderr exist (inherit stdio)
    if (!task.stdout && !task.stderr) {
      task.on('exit', code => {
        if (code) {
          const e = new StatusError('Spawn failed');
          e.code = code;

          return reject(e);
        }

        resolve();
      });
    }
  });
}

function getCache(stream: CacheStream, encoding?: BufferEncoding) {
  const buf = stream.getCache();
  stream.destroy();
  if (!encoding) return buf;

  return buf.toString(encoding);
}


// For ESM compatibility
export default promiseSpawn;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = promiseSpawn;
  // For ESM compatibility
  module.exports.default = promiseSpawn;
}
