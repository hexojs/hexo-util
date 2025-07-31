import escapeRegExp from './escape_regexp.js';

const rParam = /([:*])([\w?]*)?/g;

class Pattern {
  match: (str: string) => unknown;

  constructor(rule: Pattern | ((str: string) => unknown) | RegExp | string) {
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

  test(str: string) {
    return Boolean(this.match(str));
  }
}

function regexFilter(rule: RegExp) {
  return (str: string) => str.match(rule);
}

function stringFilter(rule: string) {
  const params = [];

  const regex = escapeRegExp(rule)
    .replace(/\\([*?])/g, '$1')
    .replace(rParam, (match, operator, name) => {
      let str = '';

      if (operator === '*') {
        str = '(.*)?';
      } else {
        str = '([^\\/]+)';
      }

      if (name) {
        if (name[name.length - 1] === '?') {
          name = name.slice(0, name.length - 1);
          str += '?';
        }

        params.push(name);
      }

      return str;
    });

  return (str: string) => {
    const match = str.match(regex);
    if (!match) return;

    const result = {};

    for (let i = 0, len = match.length; i < len; i++) {
      const name = params[i - 1];
      result[i] = match[i];
      if (name) result[name] = match[i];
    }

    return result;
  };
}


// For ESM compatibility
export default Pattern;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = Pattern;
  // For ESM compatibility
  module.exports.default = Pattern;
}
