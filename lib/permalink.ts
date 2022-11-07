import escapeRegExp from './escape_regexp';

const rParam = /:(\w*[^_\W])/g;

class Permalink {
  rule: string;
  regex: RegExp;
  params: string[];

  constructor(rule: string, options: { segments?: any; }) {
    if (!rule) { throw new TypeError('rule is required!'); }
    options = options || {};
    const segments = options.segments || {};
    const params = [];
    const regex = escapeRegExp(rule)
      .replace(rParam, (match, name) => {
        params.push(name);
        if (Object.prototype.hasOwnProperty.call(segments, name)) {
          const segment = segments[name];
          if (segment instanceof RegExp) {
            return segment.source;
          }
          return segment;
        }
        return '(.+?)';
      });
    this.rule = rule;
    this.regex = new RegExp(`^${regex}$`);
    this.params = params;
  }

  test(str: string) {
    return this.regex.test(str);
  }

  parse(str: string) {
    const match = str.match(this.regex);
    const { params } = this;
    const result = {};
    if (!match) { return; }
    for (let i = 1, len = match.length; i < len; i++) {
      result[params[i - 1]] = match[i];
    }
    return result;
  }

  stringify(data) {
    return this.rule.replace(rParam, (match, name) => data[name]);
  }
}

export = Permalink;
