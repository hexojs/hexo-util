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

  const keys = Object.keys(obj);
  const result = {};

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
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
    } else {
      result[newKey] = value;
      Object.defineProperty(result, key, {
        get: getter(newKey),
        set: setter(newKey),
        configurable: true,
        enumerable: true
      });
    }
  }

  return result;
}

module.exports = camelCaseKeys;
