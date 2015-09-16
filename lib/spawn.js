'use strict';

var sl = require('spawn-limit');
var Promise = require('bluebird');

sl.setLimit(20);

module.exports = function(command, args, options){
  if (!command) throw new TypeError('command is required!');

  if (!options && args && !Array.isArray(args)){
    options = args;
    args = [];
  }

  args = args || [];
  options = options || {};

  return new Promise(function(resolve, reject){
    var task_promise = sl.spawn(command, args, options);
    var verbose = options.verbose;
    var encoding = options.hasOwnProperty('encoding')
        ? options.encoding : 'utf8';
    var stdout = [];
    var stdoutLength = 0;
    var stderr = [];
    var stderrLength = 0;

    task_promise.then(function(then_cb) {
        task.stdout.on('data', function(data){
          stdout.push(data);
          stdoutLength += data.length;

          if (verbose) process.stdout.write(data);
        });

        task.stderr.on('data', function(data){
          stderr.push(data);
          stderrLength += data.length;

          if (verbose) process.stderr.write(data);
        });

        task.on('close', function(code){
          if (code){
            var e = new Error(
                concatBuffer(stderr, stderrLength, encoding));
            e.code = code;

            return reject(e);
          }

          resolve(then_cb(concatBuffer(stdout, stdoutLength, encoding)));
        });

    });

    task_promise.reject(function(reject_cb) {
        reject(reject_cb);
    });

  });
};

function concatBuffer(buffer, length, encoding){
  var data = Buffer.concat(buffer, length);
  if (!encoding) return data;

  return data.toString(encoding);
}
