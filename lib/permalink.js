'use strict';

const escapeRegExp = require('./escape_regexp');

const rParam = /:(\w+)/g;

function Permalink(rule, options = {}) {
  if (!rule) throw new TypeError('rule is required!');

  const { segments = {} } = options;
  const params = [];

  const regex = escapeRegExp(rule)
    .replace(rParam, (_, name) => {
      params.push(name);

      if (segments.hasOwnProperty(name)) {
        const segment = segments[name];
        return segment instanceof RegExp ? segment.source : segment;
      }

      return '(.+?)';
    });

  this.rule = rule;
  this.regex = new RegExp(`^${regex}$`);
  this.params = params;
}

Permalink.prototype.test = function(str) {
  return this.regex.test(str);
};

Permalink.prototype.parse = function(str) {
  const match = str.match(this.regex);
  const { params } = this;

  if (!match) return;

  return match.reduce((result, value, index) => {
    if (index !== 0) {
      result[params[index - 1]] = value;
    }
    return result;
  }, {});
};

Permalink.prototype.stringify = function(data) {
  return this.rule.replace(rParam, (_, name) => data[name]);
};

module.exports = Permalink;
