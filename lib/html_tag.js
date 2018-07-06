'use strict';

function htmlTag(tag, attrs, text) {
  if (!tag) throw new TypeError('tag is required!');

  let result = `<${tag}`;

  for (const i in attrs) {
    if (attrs[i]) result += ` ${i}="${attrs[i]}"`;
  }

  result += text == null ? '>' : `>${text}</${tag}>`;

  return result;
}

module.exports = htmlTag;
