'use strict';

import spawn from 'cross-spawn';
import Promise from 'bluebird';
import CacheStream from './cache_stream';

import * as child_process from 'child_process';
interface Options extends child_process.SpawnOptions {
  verbose?: boolean;
  encoding?: string;
}

function promiseSpawn(command: string, args = [], options: Options = {}) {
  if (!command) throw new TypeError('command is required!');

  if (typeof args === 'string') args = [args];

  if (!Array.isArray(args)) {
    options = args;
    args = [];
  }

  return new Promise((resolve, reject) => {
    const task = spawn(command, args, options);
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
        const e = new Error(getCache(stderrCache, encoding));
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
          const e = new Error('Spawn failed');
          e.code = code;

          return reject(e);
        }

        resolve();
      });
    }
  });
}

function getCache(stream, encoding) {
  const buf = stream.getCache();
  stream.destroy();
  if (!encoding) return buf;

  return buf.toString(encoding);
}

export default promiseSpawn;
