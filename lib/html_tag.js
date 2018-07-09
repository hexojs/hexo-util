'use strict';

function htmlTag(tag, attrs, text) {
  if (!tag) throw new TypeError('tag is required!');

  let result = `<${tag}`;

  if (attrs != null) {
    result += Object.keys(attrs).filter(key => attrs[key]).map(key => ` ${key}="${attrs[key]}"`).join('');
  }

  result += text == null ? '>' : `>${text}</${tag}>`;

  return result;
}

module.exports = htmlTag;
