'use strict';

const escapeRegExp = require('./escape_regexp');

const rParam = /([:*])([\w?]*)?/g;

function Pattern(rule) {
  if (rule instanceof Pattern) {
    return rule;
  } else if (typeof rule === 'function') {
    this.match = rule;
  } else if (rule instanceof RegExp) {
    this.match = regexFilter(rule);
  } else if (typeof rule === 'string') {
    this.match = stringFilter(rule);
  } else {
    throw new TypeError('rule must be a function, a string or a regular expression.');
  }
}

Pattern.prototype.test = function(str) {
  return Boolean(this.match(str));
};

function regexFilter(rule) {
  return str => str.match(rule);
}

function stringFilter(rule) {
  const params = [];

  const regex = escapeRegExp(rule)
    .replace(/\\([*?])/g, '$1')
    .replace(rParam, (_, operator, name) => {
      let str = operator === '*' ? '(.*)?' : '([^\\/]+)';

      if (name) {
        if (name.endsWith('?')) {
          name = name.slice(0, name.length - 1);
          str += '?';
        }

        params.push(name);
      }

      return str;
    });

  return str => {
    const match = str.match(regex);
    if (!match) return;

    return match.reduce((result, value, index) => {
      const name = params[index - 1];
      result[index] = value;
      if (name) result[name] = value;
      return result;
    }, {});
  };
}

module.exports = Pattern;
