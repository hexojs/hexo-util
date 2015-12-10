'use strict';

var spawn = require('child_process').spawn;
var Promise = require('bluebird');
var CacheStream = require('./cache_stream');

module.exports = function(command, args, options) {
  if (!command) throw new TypeError('command is required!');

  if (!options && args && !Array.isArray(args)) {
    options = args;
    args = [];
  }

  args = args || [];
  options = options || {};

  return new Promise(function(resolve, reject) {
    var task = spawn(command, args, options);
    var verbose = options.verbose;
    var encoding = options.hasOwnProperty('encoding') ? options.encoding : 'utf8';
    var stdoutCache = new CacheStream();
    var stderrCache = new CacheStream();
    var stdout = task.stdout.pipe(stdoutCache);
    var stderr = task.stderr.pipe(stderrCache);

    if (verbose) {
      stdout = stdout.pipe(process.stdout);
      stderr = stderr.pipe(process.stderr);
    }

    task.on('close', function(code) {
      if (code) {
        var e = new Error(getCache(stderrCache, encoding));
        e.code = code;

        return reject(e);
      }

      resolve(getCache(stdoutCache, encoding));
    });
  });
};

function getCache(stream, encoding) {
  var buf = stream.getCache();
  if (!encoding) return buf;

  return buf.toString(encoding);
}
