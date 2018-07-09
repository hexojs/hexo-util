'use strict';

// https://github.com/rails/rails/blob/v4.2.0/actionview/lib/action_view/helpers/text_helper.rb#L240
function wordWrap(str, options = {}) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  const { width = 80 } = options;
  const regex = new RegExp(`(.{1,${width}})(\\s+|$)`, 'g');
  const lines = str.split('\n');

  return lines.map(line => {
    return line.length > width ? line.replace(regex, '$1\n').trim() : line;
  }).join('\n');
}

module.exports = wordWrap;

