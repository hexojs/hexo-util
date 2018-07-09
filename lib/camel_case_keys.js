'use strict';

const camelCase = require('camel-case');

const rPrefixUnderscore = /^(_+)/;

function getter(key) {
  return function() {
    return this[key];
  };
}

function setter(key) {
  return function(value) {
    this[key] = value;
  };
}

function camelCaseKeys(obj) {
  if (typeof obj !== 'object') throw new TypeError('obj must be an object!');

  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key];
    const match = key.match(rPrefixUnderscore);
    let newKey;

    if (match) {
      const underscore = match[1];
      newKey = underscore + camelCase(key.substring(underscore.length));
    } else {
      newKey = camelCase(key);
    }

    if (newKey === key) {
      result[key] = value;
      return result;
    }

    result[newKey] = value;
    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: true,
      get: getter(newKey),
      set: setter(newKey)
    });

    return result;
  }, {});
}

module.exports = camelCaseKeys;
