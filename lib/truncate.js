'use strict';

function truncate(str, options = {}) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  const { length = 30, omission = '...', separator } = options;
  const omissionLength = omission.length;

  if (str.length < length) return str;

  if (!separator) {
    return str.substring(0, length - omissionLength) + omission;
  }

  const words = str.split(separator);

  let result = '';
  let resultLength = 0;

  for (const word of words) {
    if (resultLength + word.length + omissionLength >= length) {
      return result.substring(0, resultLength - 1) + omission;
    }

    result += word + separator;
    resultLength = result.length;
  }
}

module.exports = truncate;
