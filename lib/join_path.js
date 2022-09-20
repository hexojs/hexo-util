'use strict';

const { sep: sepPlatform } = require('path');

const formatPath = (str, sep) => {
  const rDedup = new RegExp('\\' + sep + '{2,}', 'g');
  return str.replace(/\/|\\/g, sep).replace(rDedup, sep);
};

const joinPath = (...args) => {
  const argsSize = args.length;

  // defaults to platform-specific path separator
  let sep = sepPlatform;
  if (typeof args[argsSize - 1] === 'object') sep = args.pop().sep;

  const result = args.join(sep);

  // Similar behaviour as path.join()
  // https://nodejs.org/api/path.html#path_path_join_paths
  if (result.length === 0) return '.';

  return formatPath(result, sep);
};

module.exports = joinPath;
